import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Board } from '../chess/Board';
import { moveFeedback } from '../chess/review';
import type { Replayed } from '../lib/line';
import { Icon } from './Icon';
import type { Arrow } from '../content/types';

/** Board + clickable move list + comment card, for stepping through annotated lines. */
export function LineExplorer({
  rep,
  orientation,
  highlightFrom,
  onPly,
  header,
  initialPly = 0,
  autoAdvanceKey,
}: {
  rep: Replayed;
  orientation: 'w' | 'b';
  /** Plies before this index are shown dimmed (shared with the main line). */
  highlightFrom?: number;
  onPly?: (ply: number) => void;
  header?: ReactNode;
  initialPly?: number;
  autoAdvanceKey?: string;
}) {
  const [ply, setPly] = useState(initialPly);
  const [playing, setPlaying] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const n = rep.moves.length;

  useEffect(() => {
    setPly(initialPly);
    setPlaying(false);
  }, [autoAdvanceKey, initialPly]);

  const go = (p: number, sound = true) => {
    const next = Math.max(0, Math.min(n, p));
    if (sound && next === ply + 1) moveFeedback(rep.moves[next - 1]);
    setPly(next);
    onPly?.(next);
  };

  useEffect(() => {
    if (!playing) return;
    if (ply >= n) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => go(ply + 1), 1100);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') go(ply + 1);
      else if (e.key === 'ArrowLeft') go(ply - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(n);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  useEffect(() => {
    const el = listRef.current?.querySelector('.mv.on');
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [ply]);

  const m = ply > 0 ? rep.moves[ply - 1] : null;
  const note = ply > 0 ? rep.notes[ply - 1] : undefined;
  const startBlack = rep.fens[0].split(' ')[1] === 'b';
  const arrows: Arrow[] = [];
  if (ply < n) {
    const nx = rep.moves[ply];
    arrows.push({ from: nx.from, to: nx.to, color: 'blue' });
  }

  return (
    <div className="explorer">
      <div className="explorer-board">
        <Board fen={rep.fens[ply]} orientation={orientation} lastMove={m ? [m.from, m.to] : null} arrows={ply < n && ply > 0 ? arrows : ply === 0 && n ? arrows : undefined} />
        <div className="stepper">
          <button type="button" className="icon-btn" onClick={() => go(0)} aria-label="First move">
            <Icon name="skip-back" size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={() => go(ply - 1)} aria-label="Previous move" disabled={ply === 0}>
            <Icon name="step-back" size={22} />
          </button>
          <button type="button" className={`icon-btn${playing ? ' on' : ''}`} onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play through'}>
            <Icon name={playing ? 'minus' : 'play'} size={18} filled={!playing} />
          </button>
          <button type="button" className="icon-btn" onClick={() => go(ply + 1)} aria-label="Next move" disabled={ply >= n}>
            <Icon name="step-fwd" size={22} />
          </button>
          <button type="button" className="icon-btn" onClick={() => go(n)} aria-label="Last move">
            <Icon name="skip" size={18} />
          </button>
        </div>
      </div>
      <div className="explorer-side">
        {header}
        <div className="note-card big">
          {ply === 0 ? (
            <span className="muted">Step through the moves with the arrows (or your keyboard’s ← →). Every move is explained.</span>
          ) : (
            <>
              <b className="note-move">
                {Math.floor((ply - 1 + (startBlack ? 1 : 0)) / 2) + 1}
                {(ply - 1 + (startBlack ? 1 : 0)) % 2 ? '…' : '.'} {m?.san}
              </b>{' '}
              {note ?? <span className="muted">No comment on this move.</span>}
            </>
          )}
        </div>
        <div className="move-list" ref={listRef}>
          {rep.moves.map((mv, i) => {
            const absolute = i + (startBlack ? 1 : 0);
            return (
              <span key={i} className="mv-wrap">
                {absolute % 2 === 0 && <span className="mn">{absolute / 2 + 1}.</span>}
                {i === 0 && startBlack && <span className="mn">1…</span>}
                <button type="button" className={`mv${i + 1 === ply ? ' on' : ''}${highlightFrom != null && i < highlightFrom ? ' shared' : ''}${rep.notes[i] ? ' noted' : ''}`} onClick={() => go(i + 1, false)}>
                  {mv.san}
                </button>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
