import { useEffect, useMemo, useRef, useState } from 'react';
import { getOpening } from '../content/openings';
import type { Opening } from '../content/types';
import { Board } from '../chess/Board';
import { useTrainer } from '../chess/useTrainer';
import { buildOpening, fullLine, plyLabel, type BuiltOpening, type OpeningLine } from '../lib/openings';
import { replay, START_FEN } from '../lib/line';
import { goBack, navigate } from '../lib/router';
import { finishDrillSession, recordOpeningQuiz, reviewCard, awardXp, XP } from '../lib/progress';
import { progressStore, useSettings } from '../lib/store';
import { sfx } from '../lib/sound';
import { haptic } from '../lib/platform';
import { hashString, shuffled } from '../lib/random';
import { Icon } from '../components/Icon';
import { Confetti } from '../components/Confetti';
import { ProgressRing, RichText } from '../components/ui';
import { ContinueBar, StepLayout } from './LessonScreen';
import { NotFound } from './NotFound';

type Mode = 'line' | 'memory' | 'deviation' | 'traps' | 'quiz' | 'speed';

const posKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

/** Maps a position to its drill card (cards are shared by identical positions). */
function cardLookup(b: BuiltOpening) {
  const map = new Map<string, string>();
  for (const c of b.cards) {
    const line = b.lines.find((l) => l.id === c.lineId)!;
    map.set(posKey(line.replay.fens[c.ply]), c.id);
  }
  return map;
}

export function DrillScreen({ openingId, mode }: { openingId: string; mode: Mode }) {
  const o = getOpening(openingId);
  if (!o) return <NotFound />;
  const close = () => goBack(`/opening/${o.id}?tab=drill`);
  return (
    <div className="player">
      {mode === 'quiz' ? (
        <QuizDrill o={o} onClose={close} />
      ) : mode === 'speed' ? (
        <SpeedDrill o={o} onClose={close} />
      ) : (
        <LineDrill o={o} mode={mode} onClose={close} />
      )}
    </div>
  );
}

function Top({ title, pct, onClose, right }: { title: string; pct: number; onClose: () => void; right?: React.ReactNode }) {
  return (
    <header className="player-top">
      <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
        <Icon name="x" size={22} />
      </button>
      <div className="player-progress">
        <div className="player-title">{title}</div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
      {right}
    </header>
  );
}

interface Task {
  key: string;
  title: string;
  subtitle?: string;
  fen: string;
  moves: string[];
  notes: (string | undefined)[];
  opponentFirst: boolean;
  orientation: 'w' | 'b';
  lastMove?: [string, string] | null;
  /** Ply offset of moves[0] within the full line, for card lookup and numbering. */
  offset: number;
  graded: boolean;
}

function buildTasks(o: Opening, mode: Mode): Task[] {
  const b = buildOpening(o);
  const p = progressStore.get();
  const learnerFirst = o.side === 'w';
  if (mode === 'line' || mode === 'memory') {
    const score = (l: OpeningLine) => {
      const ids = b.cards.filter((c) => c.lineId === l.id).map((c) => c.id);
      const due = ids.filter((id) => p.cards[id] && p.cards[id].due <= Date.now()).length;
      const fresh = ids.filter((id) => !p.cards[id]).length;
      return due * 3 + fresh * 2 + (l.id === 'main' ? 1 : 0);
    };
    const sorted = [...b.lines].sort((x, y) => score(y) - score(x));
    const pick = sorted.slice(0, 3);
    if (!pick.some((l) => l.id === 'main') && score(b.main) > 0) pick[pick.length - 1] = b.main;
    return pick.map((l) => ({
      key: l.id,
      title: l.id === 'main' ? `Main line: ${l.name}` : l.name,
      subtitle: l.summary,
      fen: START_FEN,
      moves: l.sans,
      notes: l.notes,
      opponentFirst: !learnerFirst,
      orientation: o.side,
      offset: 0,
      graded: true,
    }));
  }
  if (mode === 'deviation') {
    return b.variations
      .filter((v) => v.from % 2 === (learnerFirst ? 1 : 0))
      .map((v) => {
        const dev = v.replay.moves[v.from];
        return {
          key: v.id,
          title: v.name,
          subtitle: `Your opponent plays ${plyLabel(v.from)}${v.sans[v.from]}. What now?`,
          fen: v.replay.fens[v.from + 1],
          moves: v.sans.slice(v.from + 1),
          notes: v.notes.slice(v.from + 1),
          opponentFirst: false,
          orientation: o.side,
          lastMove: [dev.from, dev.to] as [string, string],
          offset: v.from + 1,
          graded: true,
        };
      });
  }
  // traps
  return o.traps.map((t) => {
    const f = fullLine(t.line);
    const attacker = t.side === 'you' ? o.side : o.side === 'w' ? 'b' : 'w';
    return {
      key: t.id,
      title: t.name,
      subtitle: t.side === 'you' ? 'Set the trap and spring it.' : 'Play the attacker’s side so you never fall for it.',
      fen: START_FEN,
      moves: f.moves.map((m) => m.san),
      notes: f.moves.map((m) => m.note),
      opponentFirst: attacker === 'b',
      orientation: attacker,
      offset: 0,
      graded: false,
    };
  });
}

function LineDrill({ o, mode, onClose }: { o: Opening; mode: Mode; onClose: () => void }) {
  const tasks = useMemo(() => buildTasks(o, mode), [o, mode]);
  const b = buildOpening(o);
  const lookup = useMemo(() => cardLookup(b), [b]);
  const [ti, setTi] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0, mastered: 0 });
  const [summary, setSummary] = useState<null | { xp: number }>(null);
  const graded = useRef(new Set<string>());
  const task = tasks[ti];

  const grade = (idx: number, correct: boolean, fen: string) => {
    if (!task?.graded) return;
    const key = `${task.key}:${idx}`;
    if (graded.current.has(key)) return;
    graded.current.add(key);
    const id = lookup.get(posKey(fen));
    setStats((s) => ({ ...s, correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (!id) return;
    const r = reviewCard(id, correct);
    if (r.newlyMastered) setStats((s) => ({ ...s, mastered: s.mastered + 1 }));
  };

  if (!tasks.length) {
    return (
      <>
        <Top title={o.name} pct={1} onClose={onClose} />
        <div className="center-screen">
          <div className="empty">
            <Icon name="check" size={40} />
            <h2>Nothing to drill here yet</h2>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  if (summary) return <DrillDone o={o} xp={summary.xp} correct={stats.correct} total={stats.total} mastered={stats.mastered} onClose={onClose} onAgain={() => navigate(`/drill/${o.id}?mode=${mode}&r=${Date.now()}`, { replace: true })} />;

  const next = () => {
    if (ti + 1 < tasks.length) setTi(ti + 1);
    else {
      const r = mode === 'traps' ? { xp: 10, ...awardXp(10) } : finishDrillSession(stats.correct, stats.total, stats.mastered);
      sfx.complete();
      setSummary({ xp: r.xp });
    }
  };

  return (
    <>
      <Top title={`${o.name} · ${{ line: 'Line trainer', memory: 'Memory round', deviation: 'Deviations', traps: 'Traps', quiz: 'Quiz', speed: 'Speed' }[mode]}`} pct={ti / tasks.length} onClose={onClose} right={<span className="player-count">{ti + 1}/{tasks.length}</span>} />
      <LineTask key={task.key + ti} task={task} memory={mode === 'memory'} onGrade={grade} onNext={next} last={ti + 1 === tasks.length} />
    </>
  );
}

function LineTask({ task, memory, onGrade, onNext, last }: { task: Task; memory: boolean; onGrade: (idx: number, correct: boolean, fen: string) => void; onNext: () => void; last: boolean }) {
  const fensRef = useRef<string[]>([]);
  useMemo(() => {
    fensRef.current = replay(task.moves.map((san) => ({ san })), task.fen).fens;
  }, [task]);
  const [hint, setHint] = useState(0);
  const t = useTrainer({
    fen: task.fen,
    moves: task.moves,
    opponentFirst: task.opponentFirst,
    onCorrect: (idx) => onGrade(idx, hint === 0, fensRef.current[idx]),
    onMistake: (idx) => onGrade(idx, false, fensRef.current[idx]),
    replyDelay: 380,
  });
  useEffect(() => setHint(0), [t.idx]);
  const done = t.status === 'done';
  const playedNotes = task.notes.slice(0, t.idx);
  const lastNoteIdx = (() => {
    for (let i = t.idx - 1; i >= 0; i--) if (playedNotes[i]) return i;
    return -1;
  })();
  const ghost = memory && t.idx >= 4 && !done;
  return (
    <StepLayout
      board={
        <div className={ghost ? 'ghost-board' : ''}>
          <Board fen={t.fen} orientation={task.orientation} movable={t.status === 'playing' ? t.learnerColor : false} onMove={t.handleMove} lastMove={t.lastMove ?? task.lastMove ?? null} marks={t.marks} flash={t.flash} hint={t.hint} />
        </div>
      }
      footer={
        done ? (
          <ContinueBar onContinue={onNext} last={last} tone="good" title={t.mistakes ? 'Line complete' : 'Perfect line!'} body={t.mistakes ? `${t.mistakes} slip${t.mistakes > 1 ? 's' : ''}. Those positions will come back sooner.` : 'Every move from memory.'} />
        ) : (
          <div className="foot-inner">
            <div className="foot-actions">
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => {
                  const lvl = Math.min(2, hint + 1) as 1 | 2;
                  setHint(lvl);
                  t.showHint(lvl);
                }}
                disabled={t.status !== 'playing'}
              >
                <Icon name="hint" size={18} /> Hint
              </button>
              {(t.mistakes > 0 || hint > 0) && (
                <button type="button" className="btn btn-ghost" onClick={t.revealAndPlay} disabled={t.status !== 'playing'}>
                  <Icon name="eye" size={18} /> Show move
                </button>
              )}
            </div>
            <span className={`turn-pill ${t.learnerColor}`}>Your move</span>
          </div>
        )
      }
    >
      <div className="eyebrow">
        <Icon name="target" size={14} /> {task.title}
      </div>
      <h2 className="step-title">{task.subtitle ?? 'Play the line from memory.'}</h2>
      <div className="move-list compact">
        {task.moves.slice(0, t.idx).map((san, i) => {
          const ply = task.offset + i;
          return (
            <span key={i} className="mv-wrap">
              {(ply % 2 === 0 || i === 0) && <span className="mn">{plyLabel(ply)}</span>}
              <span className="mv">{san}</span>
            </span>
          );
        })}
        {!done && <span className="mv next">?</span>}
      </div>
      {lastNoteIdx >= 0 && (
        <div className="note-card">
          <b className="note-move">
            {plyLabel(task.offset + lastNoteIdx)} {task.moves[lastNoteIdx]}
          </b>{' '}
          {playedNotes[lastNoteIdx]}
        </div>
      )}
      {t.status === 'wrong' && t.marks.some((m) => m.kind === 'bad') && <div className="wrong-card">That is not the move in this line.</div>}
    </StepLayout>
  );
}

function DrillDone({ o, xp, correct, total, mastered, onClose, onAgain }: { o: Opening; xp: number; correct: number; total: number; mastered: number; onClose: () => void; onAgain: () => void }) {
  const s = useSettings();
  const acc = total ? correct / total : 1;
  return (
    <div className="done-screen">
      {s.celebrations && acc >= 0.8 && <Confetti />}
      <div className="done-card">
        <ProgressRing value={acc} size={120} stroke={10} color="var(--gold)">
          <b className="done-pct">{Math.round(acc * 100)}%</b>
          <small>recall</small>
        </ProgressRing>
        <h1>Drill complete</h1>
        <p className="muted">
          {o.name}: {correct} of {total} moves from memory{mastered ? `, ${mastered} new position${mastered > 1 ? 's' : ''} mastered` : ''}.
        </p>
        <div className="done-stats">
          <span className="chip-stat level">
            <Icon name="zap" size={16} filled /> +{xp} XP
          </span>
        </div>
        <div className="done-actions">
          <button type="button" className="btn btn-soft" onClick={onAgain}>
            <Icon name="refresh" size={18} /> Again
          </button>
          <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizDrill({ o, onClose }: { o: Opening; onClose: () => void }) {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = o.quiz[qi];
  const order = useMemo(() => (q ? shuffled(q.options.map((_, i) => i), hashString(q.q)) : []), [q]);
  if (done) {
    return <DrillDone o={o} xp={XP.quiz} correct={score} total={o.quiz.length} mastered={0} onClose={onClose} onAgain={() => { setQi(0); setScore(0); setPicked(null); setDone(false); }} />;
  }
  const fen = q.line ? replay(q.line).fens.at(-1)! : buildOpening(o).main.replay.fens[0];
  const lastMv = q.line ? replay(q.line).moves.at(-1) : undefined;
  const answered = picked !== null;
  const correct = answered && q.options[picked!].correct;
  return (
    <>
      <Top title={`${o.name} · Idea quiz`} pct={qi / o.quiz.length} onClose={onClose} right={<span className="player-count">{qi + 1}/{o.quiz.length}</span>} />
      <StepLayout
        board={<Board fen={fen} orientation={o.side} lastMove={lastMv ? [lastMv.from, lastMv.to] : null} />}
        footer={
          answered ? (
            <ContinueBar
              onContinue={() => {
                if (qi + 1 < o.quiz.length) {
                  setQi(qi + 1);
                  setPicked(null);
                } else {
                  recordOpeningQuiz(o.id, score / o.quiz.length);
                  awardXp(XP.quiz);
                  sfx.complete();
                  setDone(true);
                }
              }}
              last={qi + 1 === o.quiz.length}
              tone={correct ? 'good' : 'bad'}
              title={correct ? 'Correct!' : 'Not quite'}
              body={q.options[picked!].why + (correct ? '' : ` The answer: ${q.options.find((x) => x.correct)!.text}`)}
            />
          ) : (
            <div className="foot-inner">
              <span className="muted small">Choose an answer</span>
            </div>
          )
        }
      >
        <div className="eyebrow">
          <Icon name="help" size={14} /> Question {qi + 1}
        </div>
        <h2 className="step-title">
          <RichText text={q.q} />
        </h2>
        <div className="options">
          {order.map((i, k) => {
            const op = q.options[i];
            const state = answered ? (op.correct ? 'correct' : i === picked ? 'wrong' : 'dim') : '';
            return (
              <button
                key={i}
                type="button"
                className={`option ${state}`}
                disabled={answered}
                onClick={() => {
                  setPicked(i);
                  if (op.correct) {
                    setScore((s) => s + 1);
                    sfx.correct();
                    void haptic('success');
                  } else {
                    sfx.wrong();
                    void haptic('error');
                  }
                }}
              >
                <span className="option-key">{k + 1}</span>
                <span>{op.text}</span>
              </button>
            );
          })}
        </div>
      </StepLayout>
    </>
  );
}

function SpeedDrill({ o, onClose }: { o: Opening; onClose: () => void }) {
  const b = buildOpening(o);
  const positions = useMemo(() => {
    const cards = shuffled(b.cards, Date.now() % 100000);
    return cards.slice(0, 10).map((c) => {
      const line = b.lines.find((l) => l.id === c.lineId)!;
      const prev = c.ply > 0 ? line.replay.moves[c.ply - 1] : null;
      return { fen: line.replay.fens[c.ply], san: line.sans[c.ply], last: prev ? ([prev.from, prev.to] as [string, string]) : null, id: c.id };
    });
  }, [b]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (over) return;
    const t = setInterval(() => setTimeLeft((x) => (x <= 1 ? 0 : x - 1)), 1000);
    return () => clearInterval(t);
  }, [over]);
  useEffect(() => {
    if (timeLeft === 0 && !over) setOver(true);
  }, [timeLeft, over]);
  const pos = positions[i];
  const t = useTrainer({
    fen: pos?.fen ?? START_FEN,
    moves: pos ? [pos.san] : [],
    replyDelay: 0,
    onComplete: (clean) => {
      if (clean) {
        const ns = streak + 1;
        setStreak(ns);
        setScore((s) => s + 1 + (ns % 3 === 0 ? 1 : 0));
      }
      setTimeout(() => (i + 1 < positions.length ? setI(i + 1) : setOver(true)), 380);
    },
    onMistake: () => {
      setStreak(0);
      setTimeout(() => (i + 1 < positions.length ? setI(i + 1) : setOver(true)), 900);
    },
  });
  useEffect(() => {
    if (over) {
      sfx.complete();
      awardXp(Math.min(30, 5 + score * 2));
    }
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
  if (over) return <DrillDone o={o} xp={Math.min(30, 5 + score * 2)} correct={Math.min(score, positions.length)} total={positions.length} mastered={0} onClose={onClose} onAgain={() => navigate(`/drill/${o.id}?mode=speed&r=${Date.now()}`, { replace: true })} />;
  return (
    <>
      <Top
        title={`${o.name} · Speed round`}
        pct={i / positions.length}
        onClose={onClose}
        right={
          <span className={`timer${timeLeft <= 10 ? ' low' : ''}`}>
            <Icon name="clock" size={16} /> {timeLeft}s
          </span>
        }
      />
      <StepLayout
        board={<Board fen={t.fen} orientation={o.side} movable={t.status === 'playing' ? t.learnerColor : false} onMove={t.handleMove} lastMove={t.lastMove ?? pos?.last ?? null} marks={t.marks} flash={t.flash} />}
        footer={
          <div className="foot-inner">
            <span className="chip-stat level">
              <Icon name="zap" size={16} filled /> {score} points
            </span>
            {streak >= 2 && (
              <span className="chip-stat streak lit">
                <Icon name="flame" size={16} filled /> {streak} in a row
              </span>
            )}
          </div>
        }
      >
        <div className="eyebrow">
          <Icon name="clock" size={14} /> Position {i + 1} of {positions.length}
        </div>
        <h2 className="step-title">Play the book move. Quickly!</h2>
        <p className="muted">Every third correct answer in a row earns a bonus point.</p>
      </StepLayout>
    </>
  );
}
