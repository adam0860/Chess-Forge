import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, type Move } from 'chess.js';
import type { BoardMove, Mark } from './Board';
import { moveFeedback } from './review';
import { sfx } from '../lib/sound';
import { haptic } from '../lib/platform';

/*
 * Drives a "find the moves" exercise: the learner plays every other move of a
 * known line and the app replies with the rest. Expected moves may be SAN or
 * UCI, with alternatives separated by "|".
 */

export type TrainerStatus = 'intro' | 'playing' | 'wrong' | 'done';

export interface TrainerOptions {
  fen: string;
  /** Expected moves from `fen`, alternating sides. */
  moves: string[];
  /** If true, moves[0] is the opponent's move, played automatically first. */
  opponentFirst?: boolean;
  /** Accept any checkmating move when the expected move mates. */
  acceptAnyMate?: boolean;
  onComplete?: (cleanRun: boolean) => void;
  onMistake?: (moveIndex: number) => void;
  onCorrect?: (moveIndex: number) => void;
  replyDelay?: number;
}

function matches(chess: Chess, played: Move, expected: string, anyMate: boolean): boolean {
  for (const alt of expected.split('|')) {
    const a = alt.trim();
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(a)) {
      if (played.from + played.to + (played.promotion ?? '') === a) return true;
      if (played.from + played.to === a && played.promotion === 'q') return true;
    } else if (played.san.replace(/[+#!?]/g, '') === a.replace(/[+#!?]/g, '')) return true;
  }
  if (anyMate && expected.includes('#') && chess.isCheckmate()) return true;
  if (anyMate && /^[a-h][1-8][a-h][1-8]/.test(expected)) {
    // UCI solutions (puzzles): accept any mate when the stored move mates too.
    if (chess.isCheckmate()) {
      const c = new Chess(chess.fen());
      c.undo();
      try {
        const exp = expected.split('|')[0];
        const em = c.move({ from: exp.slice(0, 2), to: exp.slice(2, 4), promotion: exp[4] });
        if (em.san.includes('#')) return true;
      } catch {
        /* ignore */
      }
    }
  }
  return false;
}

function applyExpected(chess: Chess, expected: string): Move | null {
  const first = expected.split('|')[0].trim();
  try {
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(first)) return chess.move({ from: first.slice(0, 2), to: first.slice(2, 4), promotion: first[4] });
    return chess.move(first);
  } catch {
    return null;
  }
}

export function useTrainer(opts: TrainerOptions) {
  const { fen: startFen, moves, opponentFirst = false, acceptAnyMate = true, replyDelay = 420 } = opts;
  const [fen, setFen] = useState(startFen);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<TrainerStatus>(opponentFirst ? 'intro' : 'playing');
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [flash, setFlash] = useState<{ square: string; tone: 'good' | 'bad'; key: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hint, setHint] = useState<string[]>([]);
  const chessRef = useRef(new Chess(startFen));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const mistakesRef = useRef(0);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    chessRef.current = new Chess(startFen);
    setFen(startFen);
    setIdx(0);
    setLastMove(null);
    setMarks([]);
    setFlash(null);
    setHint([]);
    setMistakes(0);
    mistakesRef.current = 0;
    setStatus(opponentFirst ? 'intro' : 'playing');
  }, [startFen, opponentFirst]);

  useEffect(() => {
    reset();
    return () => timers.current.forEach(clearTimeout);
  }, [reset, moves.join(' ')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play the opponent's opening move (puzzles start with it).
  useEffect(() => {
    if (status !== 'intro') return;
    later(() => {
      const m = applyExpected(chessRef.current, moves[0]);
      if (m) {
        moveFeedback(m);
        setFen(chessRef.current.fen());
        setLastMove([m.from, m.to]);
      }
      setIdx(1);
      setStatus('playing');
    }, 650);
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const learnerColor = (() => {
    const c = new Chess(startFen);
    return opponentFirst ? (c.turn() === 'w' ? 'b' : 'w') : c.turn();
  })();

  const handleMove = useCallback(
    (bm: BoardMove) => {
      if (status !== 'playing') return;
      const chess = chessRef.current;
      const before = chess.fen();
      let played: Move;
      try {
        played = chess.move({ from: bm.from, to: bm.to, promotion: bm.promotion });
      } catch {
        sfx.illegal();
        return;
      }
      const expected = moves[idx];
      setHint([]);
      if (expected && matches(chess, played, expected, acceptAnyMate)) {
        optsRef.current.onCorrect?.(idx);
        moveFeedback(played);
        setFen(chess.fen());
        setLastMove([played.from, played.to]);
        setMarks([{ square: played.to, kind: 'good' }]);
        setFlash({ square: played.to, tone: 'good', key: Date.now() });
        const next = idx + 1;
        const finished = next >= moves.length || chess.isGameOver();
        if (finished) {
          setIdx(next);
          setStatus('done');
          later(() => {
            sfx.correct();
            void haptic('success');
          }, 180);
          optsRef.current.onComplete?.(mistakesRef.current === 0);
          return;
        }
        setIdx(next);
        setStatus('wrong'); // block input while the reply plays
        later(() => {
          const r = applyExpected(chess, moves[next]);
          if (r) {
            moveFeedback(r);
            setFen(chess.fen());
            setLastMove([r.from, r.to]);
            setMarks([]);
          }
          const after = next + 1;
          setIdx(after);
          if (after >= moves.length) {
            setStatus('done');
            optsRef.current.onComplete?.(mistakesRef.current === 0);
          } else setStatus('playing');
        }, replyDelay);
      } else {
        // Show the wrong move briefly, then take it back.
        moveFeedback(played);
        setFen(chess.fen());
        setLastMove([played.from, played.to]);
        setMarks([{ square: played.to, kind: 'bad' }]);
        setFlash({ square: played.to, tone: 'bad', key: Date.now() });
        mistakesRef.current++;
        setMistakes(mistakesRef.current);
        optsRef.current.onMistake?.(idx);
        setStatus('wrong');
        later(() => {
          sfx.wrong();
          void haptic('error');
        }, 120);
        later(() => {
          chess.load(before);
          setFen(before);
          setMarks([]);
          const hist = chess.history({ verbose: true });
          const prev = hist[hist.length - 1];
          setLastMove(prev ? [prev.from, prev.to] : null);
          setStatus('playing');
        }, 850);
      }
    },
    [status, moves, idx, acceptAnyMate, replyDelay],
  );

  /** Highlights the piece to move (first press) or the target square too (second press). */
  const showHint = useCallback(
    (level: 1 | 2 = 1) => {
      const c = new Chess(chessRef.current.fen());
      const m = applyExpected(c, moves[idx] ?? '');
      if (!m) return;
      sfx.hint();
      setHint(level === 1 ? [m.from] : [m.from, m.to]);
    },
    [moves, idx],
  );

  /** The expected move in SAN, for "show solution". */
  const solutionSan = (() => {
    const c = new Chess(fen);
    return applyExpected(c, moves[idx] ?? '')?.san ?? '';
  })();

  const revealAndPlay = useCallback(() => {
    if (status !== 'playing') return;
    const c = new Chess(chessRef.current.fen());
    const m = applyExpected(c, moves[idx] ?? '');
    if (!m) return;
    mistakesRef.current++;
    setMistakes(mistakesRef.current);
    handleMoveRef.current({ from: m.from, to: m.to, promotion: m.promotion });
  }, [status, moves, idx]);
  const handleMoveRef = useRef(handleMove);
  handleMoveRef.current = handleMove;

  return { fen, idx, status, lastMove, marks, flash, mistakes, hint, learnerColor, handleMove, showHint, reset, solutionSan, revealAndPlay };
}
