import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Move } from 'chess.js';
import { Board, PieceGlyph, type BoardMove, type Mark } from '../chess/Board';
import { botMove, getBot, type Bot } from '../chess/bots';
import { engine } from '../chess/engine';
import { classify, cpWhiteFrom, moveFeedback, winPct } from '../chess/review';
import { getOpening } from '../content/openings';
import { buildOpening } from '../lib/openings';
import { capturedPieces, fromUci, START_FEN } from '../lib/line';
import { navigate } from '../lib/router';
import { recordGame } from '../lib/progress';
import { useSettings } from '../lib/store';
import { sfx } from '../lib/sound';
import { confirmDialog, pushBackHandler, toast } from '../lib/ui';
import { Icon } from '../components/Icon';
import { Confetti } from '../components/Confetti';
import { Modal } from '../components/Modal';
import { BotAvatar, EvalBar } from '../components/ui';
import { setPendingGame, takePendingGame, type GameSetup } from './PlayScreen';

type Result = { result: 'win' | 'loss' | 'draw'; reason: string; xp: number; id: string } | null;

interface PosEval {
  cpWhite: number;
  mate: number | null;
  best: string;
}

export function GameScreen() {
  const setup = useMemo(() => takePendingGame(), []);
  useEffect(() => {
    if (!setup) navigate('/play', { replace: true });
  }, [setup]);
  if (!setup) return null;
  const bot = getBot(setup.bot);
  if (!bot) return null;
  return <Game setup={setup} bot={bot} />;
}

function fmtClock(ms: number) {
  const t = Math.max(0, Math.ceil(ms / 1000));
  if (ms < 10_000) return (Math.max(0, ms) / 1000).toFixed(1);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function Game({ setup, bot }: { setup: GameSetup; bot: Bot }) {
  const s = useSettings();
  const userColor = useMemo<'w' | 'b'>(() => (setup.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : setup.color), [setup.color]);
  const startFen = setup.startFen ?? START_FEN;
  const chessRef = useRef(new Chess(startFen));
  const [fen, setFen] = useState(startFen);
  const [history, setHistory] = useState<Move[]>([]);
  const [orientation, setOrientation] = useState<'w' | 'b'>(userColor);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [showEnd, setShowEnd] = useState(false);
  const [hints, setHints] = useState(0);
  const [hintArrow, setHintArrow] = useState<{ from: string; to: string } | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [evals, setEvals] = useState<Record<string, PosEval>>({});
  const [clock, setClock] = useState(setup.time ? { w: setup.time.base * 60_000, b: setup.time.base * 60_000 } : null);
  const [viewPly, setViewPly] = useState<number | null>(null);
  const [bubble, setBubble] = useState<string | null>(bot.greet);
  const turnStart = useRef(Date.now());
  const alive = useRef(true);
  const finished = useRef(false);

  const book = useMemo(() => {
    const o = setup.opening ? getOpening(setup.opening) : null;
    return o ? buildOpening(o).main.sans : [];
  }, [setup.opening]);

  useEffect(() => {
    engine.newGame();
    const t = setTimeout(() => setBubble(null), 3500);
    return () => {
      alive.current = false;
      clearTimeout(t);
      engine.cancel();
    };
  }, []);

  useEffect(
    () =>
      pushBackHandler(() => {
        void leave();
        return true;
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const turn = fen.split(' ')[1] as 'w' | 'b';
  const over = !!result;

  const finish = (res: 'win' | 'loss' | 'draw', reason: string) => {
    if (finished.current) return;
    finished.current = true;
    const sans = chessRef.current.history();
    const id = `g${Date.now()}`;
    const r = recordGame(
      { id, date: Date.now(), bot: bot.id, color: userColor, result: res, reason, sans, startFen: startFen === START_FEN ? undefined : startFen, opening: setup.opening ?? undefined, hints },
      bot.elo,
      hints === 0,
    );
    setResult({ result: res, reason, xp: r.xp, id });
    setBubble(res === 'win' ? bot.onLose : res === 'loss' ? bot.onWin : 'A draw. Well played.');
    if (res === 'win') sfx.complete();
    else if (res === 'loss') sfx.lose();
    else sfx.gameEnd();
    setTimeout(() => alive.current && setShowEnd(true), 900);
  };

  const checkEnd = (c: Chess) => {
    if (c.isCheckmate()) finish(c.turn() === userColor ? 'loss' : 'win', 'checkmate');
    else if (c.isStalemate()) finish('draw', 'stalemate');
    else if (c.isInsufficientMaterial()) finish('draw', 'insufficient material');
    else if (c.isThreefoldRepetition()) finish('draw', 'threefold repetition');
    else if (c.isDraw()) finish('draw', '50-move rule');
  };

  const analyse = async (positionFen: string, depth = 11) => {
    if (evals[positionFen]) return evals[positionFen];
    const r = await engine.analyze(positionFen, { depth });
    const l = r.lines[0];
    const ev: PosEval = { cpWhite: cpWhiteFrom(positionFen, l?.score), mate: l?.score.mate != null ? (positionFen.split(' ')[1] === 'w' ? l.score.mate : -l.score.mate) : null, best: l?.move ?? r.bestmove };
    if (alive.current) setEvals((e) => ({ ...e, [positionFen]: ev }));
    return ev;
  };

  const apply = (mv: { from: string; to: string; promotion?: string }, byUser: boolean) => {
    const c = chessRef.current;
    const before = c.fen();
    let m: Move;
    try {
      m = c.move(mv);
    } catch {
      return null;
    }
    moveFeedback(m);
    if (clock && setup.time) {
      const spent = Date.now() - turnStart.current;
      setClock((cl) => (cl ? { ...cl, [m.color]: cl[m.color] - spent + setup.time!.inc * 1000 } : cl));
    }
    turnStart.current = Date.now();
    setFen(c.fen());
    setHistory(c.history({ verbose: true }));
    setHintArrow(null);
    setViewPly(null);
    if (!byUser) setMarks([]);
    checkEnd(c);
    void before;
    return m;
  };

  // Bot's turn.
  useEffect(() => {
    if (over || turn === userColor) return;
    let cancelled = false;
    setThinking(true);
    (async () => {
      const ply = chessRef.current.history().length;
      const sans = chessRef.current.history();
      let uci = '';
      const inBook = book.length > ply && sans.every((x, i) => x === book[i]);
      if (inBook) {
        await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
        const t = new Chess(chessRef.current.fen());
        const bm = t.move(book[ply]);
        uci = bm.from + bm.to + (bm.promotion ?? '');
      } else uci = await botMove(bot, chessRef.current.fen(), ply);
      if (cancelled || !alive.current || !uci) return;
      apply(fromUci(uci), false);
      setThinking(false);
      // Pre-compute the evaluation for coaching and hints.
      if (setup.flags || setup.hints || setup.evalBar) void analyse(chessRef.current.fen());
    })();
    return () => {
      cancelled = true;
    };
  }, [fen, over]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial evaluation when the user moves first.
  useEffect(() => {
    if (turn === userColor && (setup.flags || setup.hints || setup.evalBar)) void analyse(fen);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clock.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!clock || over) return;
    const t = setInterval(() => {
      tick((n) => n + 1);
      const left = clock[turn] - (Date.now() - turnStart.current);
      if (left <= 0) finish(turn === userColor ? 'loss' : 'win', 'timeout');
    }, 100);
    return () => clearInterval(t);
  }, [clock, turn, over]); // eslint-disable-line react-hooks/exhaustive-deps

  const onUserMove = async (bm: BoardMove) => {
    if (over || turn !== userColor || viewPly !== null) return;
    const beforeFen = chessRef.current.fen();
    const m = apply(bm, true);
    if (!m) return;
    if (setup.flags && !chessRef.current.isGameOver()) {
      const beforeEval = evals[beforeFen] ?? (await analyse(beforeFen, 10));
      const afterEval = await analyse(chessRef.current.fen(), 10);
      if (!alive.current) return;
      const wb = winPct(beforeEval.cpWhite);
      const wa = winPct(afterEval.cpWhite);
      const loss = Math.max(0, userColor === 'w' ? wb - wa : wa - wb);
      const cls = classify(loss, beforeEval.best === m.from + m.to + (m.promotion ?? ''));
      if (cls === 'best') setMarks([{ square: m.to, kind: 'best' }]);
      else if (cls === 'inaccuracy' || cls === 'mistake' || cls === 'blunder') {
        setMarks([{ square: m.to, kind: cls }]);
        if (cls === 'blunder') sfx.wrong();
      } else setMarks([]);
    }
  };

  const leave = async () => {
    if (over || history.length < 2 || (await confirmDialog({ title: 'Leave the game?', body: 'The game will count as a loss.', confirmLabel: 'Resign and leave', danger: true }))) {
      if (!over && history.length >= 2) finish('loss', 'resignation');
      navigate('/play', { replace: true });
    }
  };

  const resign = async () => {
    if (over) return;
    if (s.confirmResign && !(await confirmDialog({ title: 'Resign this game?', confirmLabel: 'Resign', danger: true }))) return;
    finish('loss', 'resignation');
  };

  const offerDraw = async () => {
    if (over) return;
    const ev = await analyse(chessRef.current.fen(), 10);
    const botView = bot ? (userColor === 'w' ? -ev.cpWhite : ev.cpWhite) : 0;
    if (history.length >= 30 && botView <= 40) {
      toast({ icon: 'handshake', title: `${bot.name} accepts the draw` });
      finish('draw', 'agreement');
    } else toast({ icon: 'handshake', title: `${bot.name} declines`, body: history.length < 30 ? 'Too early for a draw.' : 'They think they are better.' });
  };

  const takeback = () => {
    if (over || thinking) return;
    const c = chessRef.current;
    if (c.history().length < 2 && c.turn() !== userColor) return;
    c.undo();
    if (c.turn() !== userColor) c.undo();
    setHints((h) => h + 1);
    setFen(c.fen());
    setHistory(c.history({ verbose: true }));
    setMarks([]);
    turnStart.current = Date.now();
    sfx.tap();
  };

  const hint = async () => {
    if (over || turn !== userColor) return;
    const ev = await analyse(chessRef.current.fen(), 12);
    if (!ev.best) return;
    setHints((h) => h + 1);
    sfx.hint();
    const mv = fromUci(ev.best);
    setHintArrow({ from: mv.from, to: mv.to });
  };

  const viewFen = viewPly === null ? fen : (() => {
    const c = new Chess(startFen);
    for (const m of history.slice(0, viewPly)) c.move(m.san);
    return c.fen();
  })();
  const shownLast = viewPly === null ? history.at(-1) : viewPly > 0 ? history[viewPly - 1] : undefined;
  const ev = evals[fen];
  const cap = capturedPieces(viewFen);
  const botColor = userColor === 'w' ? 'b' : 'w';
  const topColor = orientation === 'w' ? 'b' : 'w';

  const PlayerBar = ({ color }: { color: 'w' | 'b' }) => {
    const isBot = color === botColor;
    const list = color === 'w' ? cap.w : cap.b;
    const diff = color === 'w' ? cap.diff : -cap.diff;
    const live = clock ? clock[color] - (turn === color && !over ? Date.now() - turnStart.current : 0) : null;
    return (
      <div className={`player-bar${turn === color && !over ? ' active' : ''}`}>
        {isBot ? <BotAvatar bot={bot} size={38} /> : <span className="you-avatar">{(s.name || 'You').slice(0, 1).toUpperCase()}</span>}
        <div className="pb-text">
          <b>
            {isBot ? bot.name : s.name || 'You'} {isBot && <small className="muted">~{bot.elo}</small>}
            {isBot && thinking && <span className="thinking-dots"><i /><i /><i /></span>}
          </b>
          <span className="captured">
            {list.map((c, i) => (
              <PieceGlyph key={i} code={c} size={15} />
            ))}
            {diff > 0 && <small className="muted">+{diff}</small>}
          </span>
        </div>
        {live !== null && <span className={`clock${turn === color && !over ? ' running' : ''}${live < 20_000 ? ' low' : ''}`}>{fmtClock(live)}</span>}
        {isBot && bubble && <div className="speech">{bubble}</div>}
      </div>
    );
  };

  return (
    <div className="game-screen">
      <header className="player-top">
        <button type="button" className="icon-btn" onClick={leave} aria-label="Leave game">
          <Icon name="x" size={22} />
        </button>
        <div className="player-title grow">
          vs {bot.name}
          {setup.opening && <small className="muted"> · {getOpening(setup.opening)?.name}</small>}
        </div>
        <button type="button" className="icon-btn" onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))} aria-label="Flip board">
          <Icon name="flip" size={20} />
        </button>
      </header>
      <div className="game-layout">
        <div className="game-board-col">
          <PlayerBar color={topColor} />
          <div className="board-row">
            {setup.evalBar && <EvalBar cp={ev?.cpWhite ?? 0} mate={ev?.mate} orientation={orientation} />}
            <div className="board-holder">
              <Board
                fen={viewFen}
                orientation={orientation}
                movable={!over && viewPly === null && turn === userColor ? userColor : false}
                onMove={onUserMove}
                lastMove={shownLast ? [shownLast.from, shownLast.to] : null}
                arrows={hintArrow ? [{ ...hintArrow, color: 'gold' }] : undefined}
                marks={viewPly === null ? marks : []}
              />
            </div>
          </div>
          <PlayerBar color={topColor === 'w' ? 'b' : 'w'} />
        </div>
        <aside className="game-side">
          <div className="game-moves">
            {history.length === 0 && <span className="muted small">{userColor === 'w' ? 'You have White. Make your first move.' : `${bot.name} has White.`}</span>}
            {history.map((m, i) => (
              <span key={i} className="mv-wrap">
                {i % 2 === 0 && <span className="mn">{i / 2 + 1}.</span>}
                <button type="button" className={`mv${(viewPly ?? history.length) === i + 1 ? ' on' : ''}`} onClick={() => setViewPly(i + 1 === history.length ? null : i + 1)}>
                  {m.san}
                </button>
              </span>
            ))}
          </div>
          {viewPly !== null && (
            <button type="button" className="btn btn-soft btn-sm" onClick={() => setViewPly(null)}>
              Back to the game
            </button>
          )}
          <div className="game-controls">
            {setup.hints && (
              <>
                <button type="button" className="ctl" onClick={hint} disabled={over || turn !== userColor}>
                  <Icon name="hint" size={20} />
                  <span>Hint</span>
                </button>
                <button type="button" className="ctl" onClick={takeback} disabled={over || thinking || history.length < 1}>
                  <Icon name="undo" size={20} />
                  <span>Takeback</span>
                </button>
              </>
            )}
            <button type="button" className="ctl" onClick={offerDraw} disabled={over}>
              <Icon name="handshake" size={20} />
              <span>Draw</span>
            </button>
            <button type="button" className="ctl danger" onClick={resign} disabled={over}>
              <Icon name="flag" size={20} />
              <span>Resign</span>
            </button>
          </div>
          {over && (
            <div className="game-over-inline">
              <b>{result!.result === 'win' ? 'You won' : result!.result === 'loss' ? 'You lost' : 'Draw'}</b> by {result!.reason}.
              <button type="button" className="btn btn-primary" onClick={() => navigate(`/review/${result!.id}`, { replace: true })}>
                <Icon name="chart" size={18} /> Review game
              </button>
            </div>
          )}
        </aside>
      </div>
      {showEnd && result && (
        <Modal open onClose={() => setShowEnd(false)} label="Game over" className="end-modal">
          {result.result === 'win' && s.celebrations && <Confetti />}
          <div className="end-head">
            <BotAvatar bot={bot} size={64} />
            <div>
              <h2 className="sheet-title">{result.result === 'win' ? 'Victory!' : result.result === 'loss' ? 'Defeat' : 'Draw'}</h2>
              <p className="muted">
                {result.result === 'draw' ? 'Drawn' : result.result === 'win' ? 'You won' : `${bot.name} won`} by {result.reason}.
              </p>
            </div>
          </div>
          <div className="speech static">“{result.result === 'win' ? bot.onLose : result.result === 'loss' ? bot.onWin : 'A fair result.'}”</div>
          <div className="done-stats">
            <span className="chip-stat level">
              <Icon name="zap" size={16} filled /> +{result.xp} XP
            </span>
            {hints > 0 && <span className="chip-stat">{hints} hint{hints > 1 ? 's' : ''} used</span>}
          </div>
          <div className="sheet-actions col">
            <button type="button" className="btn btn-primary btn-lg full" onClick={() => navigate(`/review/${result.id}`, { replace: true })}>
              <Icon name="chart" size={18} /> Review this game
            </button>
            <div className="row-actions">
              <button
                type="button"
                className="btn btn-soft grow"
                onClick={() => {
                  setPendingGame({ ...setup, color: setup.opening ? setup.color : userColor === 'w' ? 'b' : 'w' });
                  navigate(`/game?r=${Date.now()}`, { replace: true });
                }}
              >
                <Icon name="refresh" size={18} /> Rematch
              </button>
              <button type="button" className="btn btn-ghost grow" onClick={() => navigate('/play', { replace: true })}>
                New opponent
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
