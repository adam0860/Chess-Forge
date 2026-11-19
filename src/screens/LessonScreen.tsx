import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { getLesson, MODULES } from '../content/curriculum';
import { PUZZLES } from '../content/puzzles';
import type { LessonStep, Puzzle } from '../content/types';
import { Board } from '../chess/Board';
import { useTrainer } from '../chess/useTrainer';
import { moveFeedback } from '../chess/review';
import { parseLine, replay, toFen } from '../lib/line';
import { goBack, navigate } from '../lib/router';
import { addSeconds, completeLesson } from '../lib/progress';
import { progressStore, useSettings } from '../lib/store';
import { hashString, shuffled } from '../lib/random';
import { sfx } from '../lib/sound';
import { haptic } from '../lib/platform';
import { confirmDialog, pushBackHandler } from '../lib/ui';
import { Icon } from '../components/Icon';
import { Confetti } from '../components/Confetti';
import { ProgressRing, RichText } from '../components/ui';
import { NotFound } from './NotFound';

type StepResult = 'pending' | 'clean' | 'helped';

function stepFen(step: LessonStep): string {
  let fen = toFen(step.fen);
  if (step.setup) {
    const r = replay(step.setup, fen);
    fen = r.fens[r.fens.length - 1];
  }
  return fen;
}

function stepLastMove(step: LessonStep): [string, string] | null {
  if (!step.setup) return null;
  const r = replay(step.setup, toFen(step.fen));
  const m = r.moves[r.moves.length - 1];
  return m ? [m.from, m.to] : null;
}

/** Picks practice puzzles for a lesson: matching themes, deterministic per lesson, unsolved first. */
export function pickPractice(lessonId: string, themes: string[], count: number, maxRating = 9999): Puzzle[] {
  const solved = progressStore.get().puzzle.history;
  const pool = PUZZLES.filter((p) => p.themes.some((t) => themes.includes(t)) && p.rating <= maxRating);
  const ordered = shuffled(pool, hashString(lessonId));
  const fresh = ordered.filter((p) => !solved[p.id]?.ok);
  const rest = ordered.filter((p) => solved[p.id]?.ok);
  return [...fresh, ...rest].slice(0, count).sort((a, b) => a.rating - b.rating);
}

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const found = getLesson(lessonId);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<StepResult[]>([]);
  const [finished, setFinished] = useState<null | { accuracy: number; xp: number; leveledUp: boolean }>(null);
  const started = useRef(Date.now());

  // Expand practice steps into individual puzzle steps.
  const steps = useMemo(() => {
    if (!found) return [];
    const out: (LessonStep | { kind: 'puzzle'; puzzle: Puzzle; title: string; n: number; of: number })[] = [];
    for (const s of found.lesson.steps) {
      if (s.kind === 'practice') {
        const ps = pickPractice(found.lesson.id + s.title, s.themes, s.count, s.maxRating);
        ps.forEach((p, i) => out.push({ kind: 'puzzle', puzzle: p, title: s.title, n: i + 1, of: ps.length }));
      } else out.push(s);
    }
    return out;
  }, [found]);

  useEffect(
    () =>
      pushBackHandler(() => {
        void leave();
        return true;
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!found) return <NotFound />;
  const { lesson, module } = found;
  const step = steps[index];
  const gradable = (s: (typeof steps)[number]) => s.kind === 'move' || s.kind === 'quiz' || s.kind === 'square' || s.kind === 'puzzle';

  const leave = async () => {
    if (finished || index === 0 || (await confirmDialog({ title: 'Leave this lesson?', body: 'Your progress in this lesson will be lost.', confirmLabel: 'Leave', danger: true }))) {
      goBack(`/module/${module.id}`);
    }
  };

  const record = (r: StepResult) =>
    setResults((prev) => {
      const next = [...prev];
      if (next[index] === undefined || next[index] === 'pending') next[index] = r;
      return next;
    });

  const advance = () => {
    if (index + 1 < steps.length) {
      setIndex(index + 1);
      sfx.tap();
      return;
    }
    const graded = steps.map((s, i) => (gradable(s) ? results[i] : null)).filter((r) => r !== null);
    const accuracy = graded.length ? graded.filter((r) => r === 'clean').length / graded.length : 1;
    const res = completeLesson(lesson.id, accuracy, !!lesson.checkpoint);
    addSeconds((Date.now() - started.current) / 1000);
    sfx.complete();
    void haptic('success');
    setFinished({ accuracy, xp: res.xp, leveledUp: res.leveledUp });
  };

  if (finished) return <LessonDone lessonId={lesson.id} moduleId={module.id} checkpoint={!!lesson.checkpoint} {...finished} onRetry={() => { setIndex(0); setResults([]); setFinished(null); started.current = Date.now(); }} />;

  const pct = (index + (results[index] && results[index] !== 'pending' ? 1 : 0)) / steps.length;

  return (
    <div className="player">
      <header className="player-top">
        <button type="button" className="icon-btn" onClick={leave} aria-label="Close lesson">
          <Icon name="x" size={22} />
        </button>
        <div className="player-progress">
          <div className="bar">
            <div className="bar-fill" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <span className="player-count">
          {index + 1}/{steps.length}
        </span>
      </header>
      {step && (
        <StepView
          key={index}
          step={step}
          lessonTitle={lesson.title}
          checkpoint={!!lesson.checkpoint}
          onResult={record}
          onContinue={advance}
          last={index + 1 === steps.length}
        />
      )}
    </div>
  );
}

type AnyStep = LessonStep | { kind: 'puzzle'; puzzle: Puzzle; title: string; n: number; of: number };

function StepView({ step, lessonTitle, checkpoint, onResult, onContinue, last }: { step: AnyStep; lessonTitle: string; checkpoint: boolean; onResult: (r: StepResult) => void; onContinue: () => void; last: boolean }) {
  if (step.kind === 'puzzle') return <PuzzleStep step={step} onResult={onResult} onContinue={onContinue} last={last} />;
  if (step.kind === 'move') return <MoveStepView step={step} onResult={onResult} onContinue={onContinue} last={last} />;
  if (step.kind === 'quiz') return <QuizStepView step={step} onResult={onResult} onContinue={onContinue} last={last} />;
  if (step.kind === 'square') return <SquareStepView step={step} onResult={onResult} onContinue={onContinue} last={last} />;
  if (step.kind === 'demo') return <DemoStepView step={step} onContinue={onContinue} last={last} />;
  if (step.kind === 'text') return <TextStepView step={step} lessonTitle={lessonTitle} checkpoint={checkpoint} onContinue={onContinue} last={last} />;
  return null;
}

export function StepLayout({ board, children, footer, noBoard }: { board?: React.ReactNode; children: React.ReactNode; footer: React.ReactNode; noBoard?: boolean }) {
  return (
    <>
      <div className={`step${noBoard ? ' no-board' : ''}`}>
        {!noBoard && <div className="step-board">{board}</div>}
        <div className="step-panel">{children}</div>
      </div>
      <footer className="player-foot">{footer}</footer>
    </>
  );
}

export function ContinueBar({ onContinue, last, tone, title, body, disabled, label }: { onContinue: () => void; last: boolean; tone?: 'good' | 'bad' | 'info'; title?: string; body?: React.ReactNode; disabled?: boolean; label?: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !disabled && !(e.target as HTMLElement)?.closest?.('button')) onContinue();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onContinue, disabled]);
  return (
    <div className={`foot-inner${tone ? ` tone-${tone}` : ''}`}>
      {(title || body) && (
        <div className="foot-msg">
          {tone && (
            <span className="foot-icon">
              <Icon name={tone === 'good' ? 'check' : tone === 'bad' ? 'x' : 'info'} size={22} strokeWidth={3} />
            </span>
          )}
          <div>
            {title && <b>{title}</b>}
            {body && <div className="foot-body">{body}</div>}
          </div>
        </div>
      )}
      <button type="button" className={`btn btn-lg ${tone === 'bad' ? 'btn-danger' : tone === 'good' ? 'btn-success' : 'btn-primary'} foot-btn`} onClick={onContinue} disabled={disabled}>
        {label ?? (last ? 'Finish' : 'Continue')}
      </button>
    </div>
  );
}

function orientationFor(step: LessonStep, fen: string): 'w' | 'b' {
  const o = step.kind === 'practice' ? undefined : step.orientation;
  return o ?? (fen.split(' ')[1] === 'b' && step.kind !== 'text' && step.kind !== 'demo' ? 'b' : 'w');
}

function TextStepView({ step, onContinue, last, lessonTitle, checkpoint }: { step: Extract<LessonStep, { kind: 'text' }>; onContinue: () => void; last: boolean; lessonTitle: string; checkpoint: boolean }) {
  const fen = stepFen(step);
  return (
    <StepLayout
      noBoard={step.noBoard}
      board={<Board fen={fen} orientation={orientationFor(step, fen)} arrows={step.arrows} highlights={step.highlights} lastMove={stepLastMove(step)} />}
      footer={<ContinueBar onContinue={onContinue} last={last} />}
    >
      <div className="eyebrow">{checkpoint ? 'Checkpoint' : lessonTitle}</div>
      {step.title && <h2 className="step-title">{step.title}</h2>}
      <RichText text={step.body} className="step-body" />
    </StepLayout>
  );
}

function DemoStepView({ step, onContinue, last }: { step: Extract<LessonStep, { kind: 'demo' }>; onContinue: () => void; last: boolean }) {
  const base = stepFen(step);
  const r = useMemo(() => replay(step.line, base), [step.line, base]);
  const [ply, setPly] = useState(0);
  const go = (n: number) => {
    const p = Math.max(0, Math.min(r.moves.length, n));
    if (p > ply) moveFeedback(r.moves[p - 1]);
    setPly(p);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(ply + 1);
      if (e.key === 'ArrowLeft') go(ply - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const m = ply > 0 ? r.moves[ply - 1] : null;
  const note = ply > 0 ? r.notes[ply - 1] : undefined;
  return (
    <StepLayout
      board={<Board fen={r.fens[ply]} orientation={step.orientation ?? 'w'} lastMove={m ? [m.from, m.to] : stepLastMove(step)} arrows={ply === 0 ? step.arrows : undefined} />}
      footer={<ContinueBar onContinue={onContinue} last={last} label={ply < r.moves.length ? 'Skip' : undefined} />}
    >
      {step.title && <h2 className="step-title">{step.title}</h2>}
      <RichText text={step.body} className="step-body" />
      <div className="demo-moves">
        {r.moves.map((mv, i) => (
          <button key={i} type="button" className={`demo-move${i + 1 === ply ? ' on' : ''}${i + 1 > ply ? ' future' : ''}`} onClick={() => go(i + 1)}>
            {i % 2 === 0 || i === 0 ? <span className="mn">{Math.floor((i + (base.split(' ')[1] === 'b' ? 1 : 0)) / 2) + 1}{(i + (base.split(' ')[1] === 'b' ? 1 : 0)) % 2 ? '…' : '.'}</span> : null}
            {mv.san}
          </button>
        ))}
      </div>
      <div className={`note-card${note ? '' : ' empty'}`}>{note ?? (ply === 0 ? 'Use the arrows to step through the moves.' : 'No comment on this move.')}</div>
      <div className="stepper">
        <button type="button" className="icon-btn" onClick={() => go(0)} aria-label="Start">
          <Icon name="skip-back" size={18} />
        </button>
        <button type="button" className="btn btn-soft" onClick={() => go(ply - 1)} disabled={ply === 0}>
          <Icon name="step-back" size={18} /> Back
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go(ply + 1)} disabled={ply >= r.moves.length}>
          Next <Icon name="step-fwd" size={18} />
        </button>
      </div>
    </StepLayout>
  );
}

function MoveStepView({ step, onResult, onContinue, last }: { step: Extract<LessonStep, { kind: 'move' }>; onResult: (r: StepResult) => void; onContinue: () => void; last: boolean }) {
  const fen = useMemo(() => stepFen(step), [step]);
  const moves = useMemo(() => parseLine(step.solution).map((m) => m.san), [step.solution]);
  const [hintLevel, setHintLevel] = useState(0);
  const t = useTrainer({ fen, moves, onComplete: (clean) => onResult(clean && hintLevel === 0 ? 'clean' : 'helped'), onMistake: () => onResult('helped') });
  const done = t.status === 'done';
  return (
    <StepLayout
      board={
        <Board
          fen={t.fen}
          orientation={step.orientation ?? t.learnerColor}
          movable={done ? false : t.learnerColor}
          onMove={t.handleMove}
          lastMove={t.lastMove ?? stepLastMove(step)}
          marks={t.marks}
          flash={t.flash}
          hint={t.hint}
          arrows={done ? undefined : step.arrows}
        />
      }
      footer={
        done ? (
          <ContinueBar onContinue={onContinue} last={last} tone="good" title={t.mistakes ? 'Solved' : 'Excellent!'} body={step.explain} />
        ) : (
          <div className="foot-inner">
            <div className="foot-actions">
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => {
                  const lvl = Math.min(2, hintLevel + 1) as 1 | 2;
                  setHintLevel(lvl);
                  t.showHint(lvl);
                  onResult('helped');
                }}
              >
                <Icon name="hint" size={18} /> {hintLevel === 0 ? 'Hint' : 'Show more'}
              </button>
              {(t.mistakes >= 2 || hintLevel >= 2) && (
                <button type="button" className="btn btn-ghost" onClick={t.revealAndPlay}>
                  <Icon name="eye" size={18} /> Show move
                </button>
              )}
            </div>
            <span className={`turn-pill ${t.learnerColor}`}>{t.learnerColor === 'w' ? 'White' : 'Black'} to move</span>
          </div>
        )
      }
    >
      <div className="eyebrow">
        <Icon name="target" size={14} /> Your move
      </div>
      <h2 className="step-title">
        <RichText text={step.prompt} />
      </h2>
      {hintLevel > 0 && !done && <div className="hint-card"><Icon name="hint" size={16} /> {step.hint}</div>}
      {t.status === 'wrong' && t.marks.some((m) => m.kind === 'bad') && <div className="wrong-card">Not quite. Try again.</div>}
    </StepLayout>
  );
}

function PuzzleStep({ step, onResult, onContinue, last }: { step: { puzzle: Puzzle; title: string; n: number; of: number }; onResult: (r: StepResult) => void; onContinue: () => void; last: boolean }) {
  const p = step.puzzle;
  const [hinted, setHinted] = useState(false);
  const t = useTrainer({ fen: p.fen, moves: p.moves, opponentFirst: true, onComplete: (clean) => onResult(clean && !hinted ? 'clean' : 'helped'), onMistake: () => onResult('helped') });
  const done = t.status === 'done';
  const orientation = new Chess(p.fen).turn() === 'w' ? 'b' : 'w';
  return (
    <StepLayout
      board={<Board fen={t.fen} orientation={orientation} movable={t.status === 'playing' ? orientation : false} onMove={t.handleMove} lastMove={t.lastMove} marks={t.marks} flash={t.flash} hint={t.hint} />}
      footer={
        done ? (
          <ContinueBar onContinue={onContinue} last={last} tone="good" title={t.mistakes ? 'Solved' : 'Perfect!'} body={`This puzzle is rated about ${p.rating}.`} />
        ) : (
          <div className="foot-inner">
            <div className="foot-actions">
              <button type="button" className="btn btn-soft" onClick={() => { setHinted(true); t.showHint(1); onResult('helped'); }} disabled={t.status !== 'playing'}>
                <Icon name="hint" size={18} /> Hint
              </button>
              {t.mistakes >= 2 && (
                <button type="button" className="btn btn-ghost" onClick={t.revealAndPlay}>
                  <Icon name="eye" size={18} /> Show move
                </button>
              )}
            </div>
            <span className={`turn-pill ${orientation}`}>{orientation === 'w' ? 'White' : 'Black'} to move</span>
          </div>
        )
      }
    >
      <div className="eyebrow">
        <Icon name="puzzle" size={14} /> {step.title} · {step.n} of {step.of}
      </div>
      <h2 className="step-title">{t.status === 'intro' ? 'Watch your opponent’s move…' : 'Find the best move.'}</h2>
      <p className="muted">Your opponent just moved. Look for checks, captures and threats. The solution may need more than one move.</p>
      {t.status === 'wrong' && t.marks.some((m) => m.kind === 'bad') && <div className="wrong-card">Not the best. Try again.</div>}
    </StepLayout>
  );
}

function QuizStepView({ step, onResult, onContinue, last }: { step: Extract<LessonStep, { kind: 'quiz' }>; onResult: (r: StepResult) => void; onContinue: () => void; last: boolean }) {
  const s = useSettings();
  void s;
  const order = useMemo(() => shuffled(step.options.map((_, i) => i), hashString(step.prompt)), [step]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongTried, setWrongTried] = useState<number[]>([]);
  const correctIdx = step.options.findIndex((o) => o.correct);
  const solved = picked === correctIdx;
  const fen = step.noBoard ? '' : stepFen(step);
  const choose = (i: number) => {
    if (solved) return;
    setPicked(i);
    if (i === correctIdx) {
      sfx.correct();
      void haptic('success');
      onResult(wrongTried.length ? 'helped' : 'clean');
    } else {
      sfx.wrong();
      void haptic('error');
      setWrongTried((w) => [...w, i]);
      onResult('helped');
    }
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= order.length) choose(order[n - 1]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  return (
    <StepLayout
      noBoard={step.noBoard}
      board={step.noBoard ? null : <Board fen={fen} orientation={orientationFor(step, fen)} arrows={step.arrows} highlights={step.highlights} lastMove={stepLastMove(step)} />}
      footer={
        solved ? (
          <ContinueBar onContinue={onContinue} last={last} tone="good" title={wrongTried.length ? 'Got it' : 'Correct!'} body={step.options[correctIdx].why} />
        ) : picked !== null ? (
          <div className="foot-inner tone-bad">
            <div className="foot-msg">
              <span className="foot-icon">
                <Icon name="x" size={22} strokeWidth={3} />
              </span>
              <div>
                <b>Not quite</b>
                <div className="foot-body">{step.options[picked].why}</div>
              </div>
            </div>
            <span className="muted small">Pick another answer</span>
          </div>
        ) : (
          <div className="foot-inner">
            <span className="muted small">Choose an answer</span>
          </div>
        )
      }
    >
      <div className="eyebrow">
        <Icon name="help" size={14} /> Question
      </div>
      <h2 className="step-title">
        <RichText text={step.prompt} />
      </h2>
      <div className="options">
        {order.map((i, k) => {
          const o = step.options[i];
          const state = solved && i === correctIdx ? 'correct' : wrongTried.includes(i) ? 'wrong' : '';
          return (
            <button key={i} type="button" className={`option ${state}`} onClick={() => choose(i)} disabled={solved || wrongTried.includes(i)}>
              <span className="option-key">{k + 1}</span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}

function SquareStepView({ step, onResult, onContinue, last }: { step: Extract<LessonStep, { kind: 'square' }>; onResult: (r: StepResult) => void; onContinue: () => void; last: boolean }) {
  const fen = stepFen(step);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<{ sq: string; key: number } | null>(null);
  const [missed, setMissed] = useState(false);
  const need = step.all ? step.squares.length : 1;
  const done = found.length >= need;
  const click = (sq: string) => {
    if (done) return;
    if (step.squares.includes(sq) && !found.includes(sq)) {
      setFound((f) => [...f, sq]);
      sfx.correct();
      void haptic('success');
      if (found.length + 1 >= need) onResult(missed ? 'helped' : 'clean');
    } else if (!step.squares.includes(sq)) {
      setWrong({ sq, key: Date.now() });
      setMissed(true);
      sfx.wrong();
      void haptic('error');
      onResult('helped');
    }
  };
  return (
    <StepLayout
      board={
        <Board
          fen={fen}
          orientation={step.orientation ?? 'w'}
          onSquareClick={click}
          highlights={found}
          flash={wrong ? { square: wrong.sq, tone: 'bad', key: wrong.key } : found.length ? { square: found[found.length - 1], tone: 'good', key: found.length } : null}
          marks={found.map((sq) => ({ square: sq, kind: 'good' as const }))}
        />
      }
      footer={done ? <ContinueBar onContinue={onContinue} last={last} tone="good" title="Right!" body={step.explain} /> : <div className="foot-inner"><span className="muted small">Tap a square on the board</span></div>}
    >
      <div className="eyebrow">
        <Icon name="grid" size={14} /> Find the square
      </div>
      <h2 className="step-title">
        <RichText text={step.prompt} />
      </h2>
      {wrong && !done && <div className="wrong-card">That was {wrong.sq}. Try again.</div>}
    </StepLayout>
  );
}

function LessonDone({ lessonId, moduleId, checkpoint, accuracy, xp, leveledUp, onRetry }: { lessonId: string; moduleId: string; checkpoint: boolean; accuracy: number; xp: number; leveledUp: boolean; onRetry: () => void }) {
  const s = useSettings();
  const passed = !checkpoint || accuracy >= 0.8;
  const mod = MODULES.find((m) => m.id === moduleId)!;
  const i = mod.lessons.findIndex((l) => l.id === lessonId);
  const next = mod.lessons[i + 1] ?? MODULES[MODULES.indexOf(mod) + 1]?.lessons[0];
  const pct = Math.round(accuracy * 100);
  return (
    <div className="player done-screen">
      {s.celebrations && passed && accuracy >= 0.6 && <Confetti />}
      <div className="done-card">
        <div className="done-badge">
          <ProgressRing value={accuracy} size={132} stroke={10} color={passed ? 'var(--success)' : 'var(--danger)'}>
            <b className="done-pct">{pct}%</b>
            <small>accuracy</small>
          </ProgressRing>
        </div>
        <h1>{checkpoint ? (passed ? 'Checkpoint passed!' : 'Not quite there') : accuracy === 1 ? 'Flawless!' : accuracy >= 0.8 ? 'Lesson complete!' : 'Lesson complete'}</h1>
        <p className="muted">
          {checkpoint
            ? passed
              ? 'You have shown you can use these skills. The next part of the course is open.'
              : 'You need 80% to pass a checkpoint. Review the lessons and try again.'
            : accuracy === 1
              ? 'Every answer right on the first try.'
              : 'Exercises you needed help with are worth another look later.'}
        </p>
        <div className="done-stats">
          <span className="chip-stat level">
            <Icon name="zap" size={16} filled /> +{xp} XP
          </span>
          {leveledUp && (
            <span className="chip-stat streak lit">
              <Icon name="star" size={16} filled /> Level up!
            </span>
          )}
        </div>
        <div className="done-actions">
          <button type="button" className="btn btn-soft" onClick={onRetry}>
            <Icon name="refresh" size={18} /> Retry
          </button>
          {next && passed ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate(`/lesson/${next.id}`, { replace: true })}>
              Next lesson <Icon name="arrow-right" size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate(`/module/${moduleId}`, { replace: true })}>
              Back to module
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
