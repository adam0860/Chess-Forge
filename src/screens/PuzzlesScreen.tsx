import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { PUZZLES } from '../content/puzzles';
import type { Puzzle } from '../content/types';
import { Board } from '../chess/Board';
import { useTrainer } from '../chess/useTrainer';
import { navigate } from '../lib/router';
import { dueMistakes, recordPuzzle, recordStorm, reviewMistake } from '../lib/progress';
import { progressStore, useProgress, useSettings, type MistakeItem } from '../lib/store';
import { dayKey } from '../lib/dates';
import { hashString } from '../lib/random';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';
import { Confetti } from '../components/Confetti';
import { ContinueBar, StepLayout } from './LessonScreen';

export const THEMES: { id: string; label: string; icon: string; desc: string }[] = [
  { id: 'hangingPiece', label: 'Loose pieces', icon: 'target', desc: 'Grab what is left undefended.' },
  { id: 'fork', label: 'Forks', icon: 'knight', desc: 'One move, two targets.' },
  { id: 'pin', label: 'Pins', icon: 'link', desc: 'Freeze a piece in place.' },
  { id: 'skewer', label: 'Skewers', icon: 'arrow-right', desc: 'Attack through a valuable piece.' },
  { id: 'discoveredAttack', label: 'Discovered attacks', icon: 'eye', desc: 'Unmask a hidden attacker.' },
  { id: 'sacrifice', label: 'Sacrifices', icon: 'flame', desc: 'Give material to win more.' },
  { id: 'mateIn1', label: 'Mate in 1', icon: 'crown', desc: 'Finish the game.' },
  { id: 'mateIn2', label: 'Mate in 2', icon: 'crown', desc: 'Force mate in two.' },
  { id: 'backRankMate', label: 'Back-rank mates', icon: 'grid', desc: 'Kings trapped behind pawns.' },
  { id: 'promotion', label: 'Promotion', icon: 'star', desc: 'Pawns becoming queens.' },
  { id: 'endgame', label: 'Endgames', icon: 'king-w', desc: 'Few pieces, precise play.' },
  { id: 'long', label: 'Long combinations', icon: 'brain', desc: 'Three moves or more.' },
];

export const themeCount = (t: string) => PUZZLES.filter((p) => p.themes.includes(t)).length;

export function dailyPuzzle(): Puzzle {
  const pool = PUZZLES.filter((p) => p.rating >= 900 && p.moves.length >= 4);
  const list = pool.length ? pool : PUZZLES;
  return list[hashString(dayKey()) % list.length];
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const W = 220;
  const H = 44;
  const lo = Math.min(...values) - 20;
  const hi = Math.max(...values) + 20;
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * W).toFixed(1)} ${(H - ((v - lo) / (hi - lo)) * H).toFixed(1)}`).join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PuzzlesHub() {
  const p = useProgress();
  const pz = p.puzzle;
  const due = dueMistakes(p).length;
  const dailyDone = pz.dailyDone === dayKey();
  return (
    <>
      <div className="page-head">
        <h1>Puzzles</h1>
        <p className="muted">{PUZZLES.length} tactics from real engine games, every one verified by Stockfish to have a single winning line.</p>
      </div>
      <div className="puzzle-hero card">
        <div>
          <span className="eyebrow">Puzzle rating</span>
          <b className="big-num">{pz.rating}</b>
          <span className="muted small">
            {pz.solved} solved · {pz.attempted ? Math.round((pz.solved / pz.attempted) * 100) : 0}% success · best streak {pz.bestStreak}
          </span>
        </div>
        <Sparkline values={pz.ratingHistory} />
        <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/puzzle/rated')}>
          <Icon name="play" size={18} filled /> Solve rated puzzles
        </button>
      </div>
      <div className="mode-grid">
        <button type="button" className={`mode-card${dailyDone ? ' done' : ''}`} onClick={() => navigate('/puzzle/daily')}>
          <span className="mode-icon gold">
            <Icon name="calendar" size={22} />
          </span>
          <b>Daily puzzle</b>
          <small className="muted">A new challenge every day. Counts toward your streak.</small>
          <span className="pill">{dailyDone ? 'Solved today' : '+20 XP'}</span>
        </button>
        <button type="button" className="mode-card" onClick={() => navigate('/puzzle/storm')}>
          <span className="mode-icon">
            <Icon name="zap" size={22} />
          </span>
          <b>Puzzle Storm</b>
          <small className="muted">Three minutes. As many puzzles as you can. Mistakes cost time.</small>
          <span className="pill">Best {pz.stormBest}</span>
        </button>
        <button type="button" className="mode-card" onClick={() => navigate('/puzzle/mistakes')} disabled={!Object.keys(p.mistakes).length}>
          <span className="mode-icon danger">
            <Icon name="refresh" size={22} />
          </span>
          <b>Your mistakes</b>
          <small className="muted">Positions from your own games where you went wrong. Fix them for good.</small>
          <span className="pill">{due ? `${due} due` : `${Object.keys(p.mistakes).length} saved`}</span>
        </button>
      </div>
      <h2 className="section-title">Themes</h2>
      <div className="theme-grid">
        {THEMES.map((t) => {
          const st = pz.themes[t.id];
          const n = themeCount(t.id);
          if (!n) return null;
          return (
            <button key={t.id} type="button" className="theme-card" onClick={() => navigate(`/puzzle/theme-${t.id}`)}>
              <span className="mode-icon small">
                <Icon name={t.icon} size={18} />
              </span>
              <span className="grow">
                <b>{t.label}</b>
                <small className="muted">{t.desc}</small>
              </span>
              <span className="theme-stat">{st ? `${Math.round((st.ok / st.total) * 100)}%` : `${n}`}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function nextRated(theme?: string): Puzzle | null {
  const p = progressStore.get();
  const r = p.puzzle.rating;
  const pool = PUZZLES.filter((x) => !p.puzzle.history[x.id] && (!theme || x.themes.includes(theme)));
  const fallback = PUZZLES.filter((x) => (!theme || x.themes.includes(theme)) && !p.puzzle.history[x.id]?.ok);
  const list = pool.length ? pool : fallback.length ? fallback : PUZZLES.filter((x) => !theme || x.themes.includes(theme));
  if (!list.length) return null;
  const near = [...list].sort((a, b) => Math.abs(a.rating - r) - Math.abs(b.rating - r)).slice(0, 12);
  return near[Math.floor(Math.random() * near.length)];
}

export function PuzzleSession({ mode }: { mode: string }) {
  if (mode === 'storm') return <Storm />;
  if (mode === 'mistakes') return <MistakeSession />;
  return <RatedSession mode={mode} />;
}

function SessionTop({ title, right, onClose }: { title: string; right?: React.ReactNode; onClose: () => void }) {
  return (
    <header className="player-top">
      <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
        <Icon name="x" size={22} />
      </button>
      <div className="player-title grow">{title}</div>
      {right}
    </header>
  );
}

function RatedSession({ mode }: { mode: string }) {
  const p = useProgress();
  const theme = mode.startsWith('theme-') ? mode.slice(6) : undefined;
  const daily = mode === 'daily';
  const [puzzle, setPuzzle] = useState<Puzzle | null>(() => (daily ? dailyPuzzle() : nextRated(theme)));
  const [outcome, setOutcome] = useState<null | { ok: boolean; delta: number; xp: number }>(null);
  const [count, setCount] = useState(0);
  const failed = useRef(false);
  const hinted = useRef(false);
  const themeLabel = theme ? THEMES.find((t) => t.id === theme)?.label : undefined;
  const t = useTrainer({
    fen: puzzle?.fen ?? new Chess().fen(),
    moves: puzzle?.moves ?? [],
    opponentFirst: true,
    onMistake: () => {
      if (!failed.current && puzzle) {
        failed.current = true;
        const r = recordPuzzle(puzzle.id, puzzle.rating, false, puzzle.themes, { rated: !theme && !daily, daily });
        setOutcome({ ok: false, delta: r.delta, xp: 0 });
      }
    },
    onComplete: (clean) => {
      if (!puzzle) return;
      if (clean && !failed.current) {
        const r = recordPuzzle(puzzle.id, puzzle.rating, !hinted.current, puzzle.themes, { rated: !theme && !daily, daily });
        setOutcome({ ok: !hinted.current, delta: r.delta, xp: r.xp });
      } else if (!failed.current) setOutcome({ ok: false, delta: 0, xp: 0 });
    },
  });
  if (!puzzle) {
    return (
      <div className="player">
        <SessionTop title="Puzzles" onClose={() => navigate('/puzzles')} />
        <div className="center-screen">
          <div className="empty">
            <h2>No puzzles found</h2>
          </div>
        </div>
      </div>
    );
  }
  const orientation = new Chess(puzzle.fen).turn() === 'w' ? 'b' : 'w';
  const done = t.status === 'done';
  const next = () => {
    if (daily) {
      navigate('/puzzles');
      return;
    }
    failed.current = false;
    hinted.current = false;
    setOutcome(null);
    setCount((c) => c + 1);
    setPuzzle(nextRated(theme));
  };
  return (
    <div className="player">
      <SessionTop
        title={daily ? 'Daily puzzle' : themeLabel ? `Puzzles · ${themeLabel}` : 'Rated puzzles'}
        onClose={() => navigate('/puzzles')}
        right={
          <span className="rating-chip">
            <Icon name="gauge" size={16} /> {p.puzzle.rating}
            {outcome && outcome.delta !== 0 && <small className={outcome.delta > 0 ? 'good-text' : 'bad-text'}> {outcome.delta > 0 ? '+' : ''}{outcome.delta}</small>}
          </span>
        }
      />
      <StepLayout
        board={<Board fen={t.fen} orientation={orientation} movable={t.status === 'playing' ? orientation : false} onMove={t.handleMove} lastMove={t.lastMove} marks={t.marks} flash={t.flash} hint={t.hint} />}
        footer={
          done ? (
            <ContinueBar onContinue={next} last={false} label={daily ? 'Done' : 'Next puzzle'} tone={outcome?.ok ? 'good' : 'info'} title={outcome?.ok ? 'Solved!' : 'Solved with help'} body={outcome?.xp ? `+${outcome.xp} XP` : 'Keep going. Every puzzle trains your pattern memory.'} />
          ) : (
            <div className="foot-inner">
              <div className="foot-actions">
                <button type="button" className="btn btn-soft" disabled={t.status !== 'playing'} onClick={() => { hinted.current = true; t.showHint(1); }}>
                  <Icon name="hint" size={18} /> Hint
                </button>
                {failed.current && (
                  <button type="button" className="btn btn-ghost" onClick={t.revealAndPlay} disabled={t.status !== 'playing'}>
                    <Icon name="eye" size={18} /> Show solution
                  </button>
                )}
                {!daily && (
                  <button type="button" className="btn btn-ghost subtle" onClick={next}>
                    Skip
                  </button>
                )}
              </div>
              <span className={`turn-pill ${orientation}`}>{orientation === 'w' ? 'White' : 'Black'} to move</span>
            </div>
          )
        }
      >
        <div className="eyebrow">
          <Icon name="puzzle" size={14} /> {daily ? dayKey() : `Puzzle ${count + 1}`} · rated {puzzle.rating}
        </div>
        <h2 className="step-title">{t.status === 'intro' ? 'Your opponent moves…' : done ? 'Well done.' : 'Find the best move.'}</h2>
        {outcome && !outcome.ok && !done && <div className="wrong-card">Not the best move. You can keep trying; the puzzle counts as missed.</div>}
        {done && (
          <div className="tag-row">
            {puzzle.themes
              .filter((th) => THEMES.some((x) => x.id === th))
              .map((th) => (
                <span key={th} className="pill">
                  {THEMES.find((x) => x.id === th)!.label}
                </span>
              ))}
          </div>
        )}
      </StepLayout>
    </div>
  );
}

function MistakeSession() {
  const p = useProgress();
  const queue = useMemo(() => {
    const due = dueMistakes(progressStore.get());
    return due.length ? due : Object.values(progressStore.get().mistakes).slice(0, 10);
  }, []);
  const [i, setI] = useState(0);
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const item: MistakeItem | undefined = queue[i];
  const t = useTrainer({
    fen: item?.fen ?? new Chess().fen(),
    moves: item ? [item.best] : [],
    onMistake: () => {
      if (outcome === null && item) {
        setOutcome(false);
        reviewMistake(item.id, false);
      }
    },
    onComplete: (clean) => {
      if (outcome === null && item) {
        setOutcome(clean);
        reviewMistake(item.id, clean);
      }
    },
  });
  void p;
  if (!item) {
    return (
      <div className="player">
        <SessionTop title="Your mistakes" onClose={() => navigate('/puzzles')} />
        <div className="center-screen">
          <div className="empty">
            <Icon name="check" size={42} />
            <h2>All caught up</h2>
            <p className="muted">Review a game to collect new positions here.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/puzzles')}>
              Back to puzzles
            </button>
          </div>
        </div>
      </div>
    );
  }
  const orientation = new Chess(item.fen).turn();
  return (
    <div className="player">
      <SessionTop title="Your mistakes" onClose={() => navigate('/puzzles')} right={<span className="player-count">{i + 1}/{queue.length}</span>} />
      <StepLayout
        board={<Board fen={t.fen} orientation={orientation} movable={t.status === 'playing' ? orientation : false} onMove={t.handleMove} lastMove={t.lastMove} marks={t.marks} flash={t.flash} hint={t.hint} />}
        footer={
          t.status === 'done' ? (
            <ContinueBar
              onContinue={() => {
                if (i + 1 < queue.length) {
                  setI(i + 1);
                  setOutcome(null);
                } else navigate('/puzzles');
              }}
              last={i + 1 >= queue.length}
              tone={outcome ? 'good' : 'info'}
              title={outcome ? 'Fixed!' : 'Now you know'}
              body={outcome ? 'This position will come back once more to make sure.' : 'It will come back soon.'}
            />
          ) : (
            <div className="foot-inner">
              <div className="foot-actions">
                <button type="button" className="btn btn-soft" onClick={() => t.showHint(1)} disabled={t.status !== 'playing'}>
                  <Icon name="hint" size={18} /> Hint
                </button>
                {outcome === false && (
                  <button type="button" className="btn btn-ghost" onClick={t.revealAndPlay}>
                    <Icon name="eye" size={18} /> Show move
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        <div className="eyebrow">
          <Icon name="history" size={14} /> From one of your games
        </div>
        <h2 className="step-title">In the game you played {item.played}. Find the better move.</h2>
      </StepLayout>
    </div>
  );
}

function Storm() {
  const s = useSettings();
  const DURATION = 180;
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState(0);
  const [over, setOver] = useState(false);
  const [idx, setIdx] = useState(0);
  const queue = useMemo(() => {
    // Ramp up difficulty: easy puzzles first.
    const byRating = [...PUZZLES].sort((a, b) => a.rating - b.rating);
    const out: Puzzle[] = [];
    const buckets = 40;
    for (let i = 0; i < buckets; i++) {
      const lo = Math.floor((i / buckets) * byRating.length);
      const hi = Math.max(lo + 1, Math.floor(((i + 1) / buckets) * byRating.length));
      out.push(byRating[lo + Math.floor(Math.random() * (hi - lo))]);
    }
    return out;
  }, []);
  const missed = useRef(false);
  const puzzle = queue[idx];
  const advance = () => {
    missed.current = false;
    if (idx + 1 < queue.length) setIdx(idx + 1);
    else setOver(true);
  };
  const t = useTrainer({
    fen: puzzle.fen,
    moves: puzzle.moves,
    opponentFirst: true,
    replyDelay: 200,
    onMistake: () => {
      missed.current = true;
      setCombo(0);
      setErrors((e) => e + 1);
      setTimeLeft((x) => Math.max(0, x - 10));
      setTimeout(advance, 700);
    },
    onComplete: () => {
      if (missed.current) return;
      setScore((x) => x + 1);
      setCombo((c) => {
        const n = c + 1;
        if (n % 5 === 0) setTimeLeft((x) => x + 3);
        return n;
      });
      setTimeout(advance, 250);
    },
  });
  useEffect(() => {
    if (!started || over) return;
    const iv = setInterval(() => setTimeLeft((x) => (x <= 1 ? 0 : x - 1)), 1000);
    return () => clearInterval(iv);
  }, [started, over]);
  useEffect(() => {
    if (timeLeft === 0 && started && !over) setOver(true);
  }, [timeLeft, started, over]);
  useEffect(() => {
    if (over) {
      recordStorm(score);
      sfx.complete();
    }
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!started) {
    return (
      <div className="player">
        <SessionTop title="Puzzle Storm" onClose={() => navigate('/puzzles')} />
        <div className="center-screen">
          <div className="empty storm-intro">
            <span className="mode-icon big">
              <Icon name="zap" size={36} />
            </span>
            <h1>Puzzle Storm</h1>
            <p className="muted">Solve as many puzzles as you can in 3 minutes. Puzzles get harder as you go. A mistake costs 10 seconds; every 5 in a row gives back 3.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setStarted(true)}>
              <Icon name="play" size={18} filled /> Start
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (over) {
    return (
      <div className="player done-screen">
        {s.celebrations && score >= progressStore.get().puzzle.stormBest && score > 0 && <Confetti />}
        <div className="done-card">
          <span className="mode-icon big">
            <Icon name="zap" size={36} />
          </span>
          <h1>{score} solved</h1>
          <p className="muted">
            {errors} mistake{errors === 1 ? '' : 's'} · best {Math.max(score, progressStore.get().puzzle.stormBest)}
          </p>
          <div className="done-actions">
            <button type="button" className="btn btn-soft" onClick={() => navigate(`/puzzle/storm?r=${Date.now()}`, { replace: true })}>
              <Icon name="refresh" size={18} /> Again
            </button>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/puzzles')}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }
  const orientation = new Chess(puzzle.fen).turn() === 'w' ? 'b' : 'w';
  return (
    <div className="player">
      <SessionTop
        title="Puzzle Storm"
        onClose={() => navigate('/puzzles')}
        right={
          <span className={`timer${timeLeft <= 20 ? ' low' : ''}`}>
            <Icon name="clock" size={16} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        }
      />
      <StepLayout
        board={<Board fen={t.fen} orientation={orientation} movable={t.status === 'playing' ? orientation : false} onMove={t.handleMove} lastMove={t.lastMove} marks={t.marks} flash={t.flash} />}
        footer={
          <div className="foot-inner">
            <span className="chip-stat level">
              <Icon name="zap" size={16} filled /> {score}
            </span>
            {combo >= 2 && (
              <span className="chip-stat streak lit">
                <Icon name="flame" size={16} filled /> {combo} combo
              </span>
            )}
          </div>
        }
      >
        <div className="eyebrow">
          <Icon name="puzzle" size={14} /> Puzzle {idx + 1} · {orientation === 'w' ? 'White' : 'Black'} to move
        </div>
        <h2 className="step-title">Find the winning move!</h2>
      </StepLayout>
    </div>
  );
}
