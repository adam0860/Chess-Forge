import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Board, type Mark } from '../chess/Board';
import { getBot } from '../chess/bots';
import { explainMistake, moveFeedback, reviewGame, winPct } from '../chess/review';
import { START_FEN } from '../lib/line';
import { navigate } from '../lib/router';
import { addMistakes, updateGame } from '../lib/progress';
import { checkAchievements } from '../lib/achievements';
import { useProgress, type ReviewMove } from '../lib/store';
import { Icon } from '../components/Icon';
import { BotAvatar } from '../components/ui';
import { NotFound } from './NotFound';

const CLS_LABEL: Record<ReviewMove['cls'], string> = { best: 'Best', good: 'Good', book: 'Book', inaccuracy: 'Inaccuracy', mistake: 'Mistake', blunder: 'Blunder' };

export function ReviewScreen({ gameId }: { gameId: string }) {
  const p = useProgress();
  const game = p.games.find((g) => g.id === gameId);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [ply, setPly] = useState(0);
  const [showBest, setShowBest] = useState(false);

  const fens = useMemo(() => {
    if (!game) return [];
    const c = new Chess(game.startFen ?? START_FEN);
    const out = [c.fen()];
    for (const san of game.sans) {
      c.move(san);
      out.push(c.fen());
    }
    return out;
  }, [game]);
  const moves = useMemo(() => {
    if (!game) return [];
    const c = new Chess(game.startFen ?? START_FEN);
    return game.sans.map((san) => c.move(san));
  }, [game]);

  useEffect(() => {
    if (!game || game.review) return;
    let alive = true;
    setProgress({ done: 0, total: game.sans.length + 1 });
    reviewGame(game.sans, game.startFen, (done, total) => alive && setProgress({ done, total })).then((review) => {
      if (!alive) return;
      const acc = game.color === 'w' ? review.accuracy.w : review.accuracy.b;
      updateGame(game.id, { review, accuracy: acc });
      // Turn your mistakes into puzzles for later review.
      const items = review.moves
        .filter((m) => (m.cls === 'mistake' || m.cls === 'blunder') && fens[m.ply].split(' ')[1] === game.color && m.best)
        .map((m) => {
          const c = new Chess(fens[m.ply]);
          const best = c.move(m.best);
          return { id: `${game.id}:${m.ply}`, fen: fens[m.ply], best: best.from + best.to + (best.promotion ?? ''), played: m.san, gameId: game.id };
        });
      if (items.length) addMistakes(items);
      checkAchievements();
      setProgress(null);
    });
    return () => {
      alive = false;
    };
  }, [game?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(ply + 1);
      if (e.key === 'ArrowLeft') go(ply - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (!game) return <NotFound />;
  const bot = getBot(game.bot);
  const review = game.review;
  const go = (n: number) => {
    const next = Math.max(0, Math.min(game.sans.length, n));
    if (next === ply + 1) moveFeedback(moves[next - 1]);
    setPly(next);
    setShowBest(false);
  };

  if (!review) {
    const pct = progress ? progress.done / progress.total : 0;
    return (
      <div className="center-screen">
        <div className="empty">
          <span className="spinner" />
          <h2>Analysing your game…</h2>
          <p className="muted">Stockfish is checking every move. This takes a few seconds.</p>
          <div className="bar" style={{ width: 260 }}>
            <div className="bar-fill" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  const rm = ply > 0 ? review.moves[ply - 1] : null;
  const mine = (m: ReviewMove) => fens[m.ply].split(' ')[1] === game.color;
  const keyMoments = review.moves
    .filter((m) => mine(m) && (m.cls === 'blunder' || m.cls === 'mistake' || m.cls === 'inaccuracy'))
    .sort((a, b) => {
      const la = Math.abs(winPct(a.cpBefore) - winPct(a.cpAfter));
      const lb = Math.abs(winPct(b.cpBefore) - winPct(b.cpAfter));
      return lb - la;
    })
    .slice(0, 3)
    .sort((a, b) => a.ply - b.ply);
  const marks: Mark[] = rm ? [{ square: moves[ply - 1].to, kind: rm.cls === 'good' ? 'good' : rm.cls }] : [];
  const bestArrow = rm && showBest && rm.best && rm.best !== rm.san ? (() => {
    const c = new Chess(fens[ply - 1]);
    const b = c.move(rm.best);
    return [{ from: b.from, to: b.to, color: 'green' as const }];
  })() : undefined;
  const myAcc = game.color === 'w' ? review.accuracy.w : review.accuracy.b;
  const botAcc = game.color === 'w' ? review.accuracy.b : review.accuracy.w;
  const myCounts: Record<string, number> = {};
  for (const m of review.moves) if (mine(m)) myCounts[m.cls] = (myCounts[m.cls] ?? 0) + 1;

  return (
    <>
      <button type="button" className="back-link" onClick={() => navigate('/play')}>
        <Icon name="arrow-left" size={18} /> Play
      </button>
      <div className="review-head">
        {bot && <BotAvatar bot={bot} size={52} />}
        <div className="grow">
          <span className="eyebrow">Game review</span>
          <h1>
            {game.result === 'win' ? 'Won' : game.result === 'loss' ? 'Lost' : 'Drew'} vs {bot?.name}
          </h1>
          <span className="muted small">
            {new Date(game.date).toLocaleString()} · {game.reason} · {Math.ceil(game.sans.length / 2)} moves
          </span>
        </div>
      </div>
      <div className="acc-row">
        <div className="acc-card you">
          <span className="muted small">Your accuracy</span>
          <b>{myAcc}%</b>
        </div>
        <div className="acc-card">
          <span className="muted small">{bot?.name}</span>
          <b>{botAcc}%</b>
        </div>
        <div className="acc-counts">
          {(['best', 'good', 'book', 'inaccuracy', 'mistake', 'blunder'] as const).map((k) => (
            <span key={k} className={`count-chip q-${k}`}>
              <b>{myCounts[k] ?? 0}</b> {CLS_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      <EvalGraph moves={review.moves} ply={ply} onPick={go} color={game.color} />

      <div className="review-layout">
        <div className="review-board">
          <Board fen={fens[ply]} orientation={game.color} lastMove={ply > 0 ? [moves[ply - 1].from, moves[ply - 1].to] : null} marks={marks} arrows={bestArrow} />
          <div className="stepper">
            <button type="button" className="icon-btn" onClick={() => go(0)} aria-label="Start">
              <Icon name="skip-back" size={18} />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(ply - 1)} aria-label="Back">
              <Icon name="step-back" size={22} />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(ply + 1)} aria-label="Forward">
              <Icon name="step-fwd" size={22} />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(game.sans.length)} aria-label="End">
              <Icon name="skip" size={18} />
            </button>
          </div>
        </div>
        <div className="review-side">
          {rm ? (
            <div className={`verdict q-${rm.cls}`}>
              <div className="verdict-top">
                <b>
                  {Math.floor(rm.ply / 2) + 1}
                  {rm.ply % 2 ? '…' : '.'} {rm.san}
                </b>
                <span className={`cls-tag q-${rm.cls}`}>{CLS_LABEL[rm.cls]}</span>
                <span className="muted small grow right">{(rm.cpAfter / 100 > 0 ? '+' : '') + (Math.abs(rm.cpAfter) > 9000 ? (rm.cpAfter > 0 ? 'M' : '−M') : (rm.cpAfter / 100).toFixed(1))}</span>
              </div>
              {(rm.cls === 'inaccuracy' || rm.cls === 'mistake' || rm.cls === 'blunder') && <p>{explainMistake(rm, fens[rm.ply])}</p>}
              {rm.best && rm.best !== rm.san && rm.cls !== 'book' && (
                <button type="button" className="btn btn-soft btn-sm" onClick={() => setShowBest(!showBest)}>
                  <Icon name="eye" size={16} /> {showBest ? 'Hide' : 'Show'} best move ({rm.best})
                </button>
              )}
              {showBest && rm.pv && rm.pv.length > 1 && <p className="muted small">Engine line: {rm.pv.join(' ')}</p>}
            </div>
          ) : (
            <div className="verdict">
              <p className="muted">Step through the game, or jump to a key moment below.</p>
            </div>
          )}
          <h3 className="section-title small">Key moments</h3>
          {keyMoments.length === 0 ? (
            <p className="muted small">No serious mistakes. Excellent game!</p>
          ) : (
            <div className="moments">
              {keyMoments.map((m) => (
                <button key={m.ply} type="button" className={`moment q-${m.cls}`} onClick={() => go(m.ply + 1)}>
                  <span className={`cls-dot q-${m.cls}`} />
                  <span className="grow">
                    <b>
                      {Math.floor(m.ply / 2) + 1}
                      {m.ply % 2 ? '…' : '.'} {m.san}
                    </b>{' '}
                    <small className="muted">{CLS_LABEL[m.cls]} · better was {m.best}</small>
                  </span>
                  <Icon name="chevron-right" size={16} />
                </button>
              ))}
            </div>
          )}
          {Object.keys(p.mistakes).some((k) => k.startsWith(game.id)) && (
            <button type="button" className="btn btn-primary full" onClick={() => navigate('/puzzle/mistakes')}>
              <Icon name="refresh" size={18} /> Practise your mistakes
            </button>
          )}
          <div className="move-list review-moves">
            {review.moves.map((m, i) => (
              <span key={i} className="mv-wrap">
                {i % 2 === 0 && <span className="mn">{i / 2 + 1}.</span>}
                <button type="button" className={`mv q-${m.cls}${ply === i + 1 ? ' on' : ''}`} onClick={() => go(i + 1)}>
                  {m.san}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function EvalGraph({ moves, ply, onPick, color }: { moves: ReviewMove[]; ply: number; onPick: (p: number) => void; color: 'w' | 'b' }) {
  const W = 600;
  const H = 110;
  const pts = [winPct(moves[0]?.cpBefore ?? 0), ...moves.map((m) => winPct(m.cpAfter))];
  const x = (i: number) => (pts.length > 1 ? (i / (pts.length - 1)) * W : 0);
  const y = (v: number) => H - (v / 100) * H;
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <div className="eval-graph card">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Winning chances through the game (White above the line)">
        <rect x="0" y="0" width={W} height={H} fill="var(--graph-black, #2a2c33)" />
        <path d={`${line} L${W} ${H} L0 ${H} Z`} fill="var(--graph-white, #e9e5dc)" />
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="rgba(128,128,128,.5)" strokeDasharray="4 4" />
        {moves.map((m, i) =>
          (m.cls === 'mistake' || m.cls === 'blunder') && (i % 2 === 0) === (color === 'w') ? (
            <circle key={i} cx={x(i + 1)} cy={y(pts[i + 1])} r="4" fill={m.cls === 'blunder' ? 'var(--q-blunder)' : 'var(--q-mistake)'} />
          ) : null,
        )}
        <line x1={x(ply)} x2={x(ply)} y1="0" y2={H} stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <div
        className="eval-graph-hit"
        onPointerDown={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          onPick(Math.round(((e.clientX - r.left) / r.width) * (pts.length - 1)));
        }}
      />
    </div>
  );
}

