import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Chess, type Square } from 'chess.js';
import { PIECE_SVG } from './pieces';
import { BOARDS, PIECE_SETS } from '../lib/themes';
import { useSettings } from '../lib/store';
import { useReducedMotion } from '../lib/motion';
import type { Arrow } from '../content/types';

export type MarkKind = 'good' | 'bad' | 'best' | 'brilliant' | 'inaccuracy' | 'mistake' | 'blunder' | 'book' | 'hint';
export interface Mark {
  square: string;
  kind: MarkKind;
}
export interface BoardMove {
  from: string;
  to: string;
  promotion?: string;
}

interface Props {
  fen: string;
  orientation?: 'w' | 'b';
  /** Which side the user may move. */
  movable?: 'w' | 'b' | 'both' | false;
  onMove?: (m: BoardMove) => void;
  onSquareClick?: (sq: string) => void;
  lastMove?: [string, string] | null;
  arrows?: Arrow[];
  highlights?: string[];
  marks?: Mark[];
  hint?: string[];
  flash?: { square: string; tone: 'good' | 'bad'; key: number } | null;
  coordinates?: boolean;
  className?: string;
  label?: string;
}

const FILES = 'abcdefgh';
const sqToXY = (sq: string, flip: boolean) => {
  const f = FILES.indexOf(sq[0]);
  const r = Number(sq[1]) - 1;
  return flip ? { x: 7 - f, y: r } : { x: f, y: 7 - r };
};
const xyToSq = (x: number, y: number, flip: boolean) => (flip ? FILES[7 - x] + (y + 1) : FILES[x] + (8 - y));

interface PlacedPiece {
  id: string;
  code: string; // e.g. 'wq'
  sq: string;
  dying?: boolean;
}

let pieceSeq = 0;

function parsePlacement(fen: string): { code: string; sq: string }[] {
  const out: { code: string; sq: string }[] = [];
  const rows = fen.split(' ')[0].split('/');
  rows.forEach((row, ri) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += Number(ch);
      else {
        out.push({ code: (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toLowerCase(), sq: FILES[f] + (8 - ri) });
        f++;
      }
    }
  });
  return out;
}

/** Matches pieces across positions so moved pieces keep their identity and glide. */
function matchPieces(prev: PlacedPiece[], next: { code: string; sq: string }[], lastMove?: [string, string] | null): PlacedPiece[] {
  const live = prev.filter((p) => !p.dying);
  const used = new Set<string>();
  const result: (PlacedPiece | null)[] = next.map((n) => {
    const same = live.find((p) => !used.has(p.id) && p.code === n.code && p.sq === n.sq);
    if (same) {
      used.add(same.id);
      return { ...same };
    }
    return null;
  });
  // Prefer the piece that came from the last move's origin.
  next.forEach((n, i) => {
    if (result[i]) return;
    const candidates = live.filter((p) => !used.has(p.id) && (p.code === n.code || (lastMove && p.sq === lastMove[0] && p.code[1] === 'p')));
    if (!candidates.length) return;
    const dist = (p: PlacedPiece) => {
      if (lastMove && p.sq === lastMove[0] && n.sq === lastMove[1]) return -1;
      return Math.abs(FILES.indexOf(p.sq[0]) - FILES.indexOf(n.sq[0])) + Math.abs(Number(p.sq[1]) - Number(n.sq[1]));
    };
    const best = candidates.sort((a, b) => dist(a) - dist(b))[0];
    if (best.code !== n.code && dist(best) !== -1) return;
    used.add(best.id);
    result[i] = { id: best.id, code: n.code, sq: n.sq };
  });
  const placed = result.map((r, i) => r ?? { id: `p${++pieceSeq}`, code: next[i].code, sq: next[i].sq });
  const dying = live.filter((p) => !used.has(p.id)).map((p) => ({ ...p, dying: true }));
  return [...placed, ...dying];
}

const MARK_GLYPH: Record<MarkKind, string> = {
  good: '✓',
  bad: '✕',
  best: '★',
  brilliant: '!!',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  book: '≡',
  hint: '•',
};

export function Board({
  fen,
  orientation = 'w',
  movable = false,
  onMove,
  onSquareClick,
  lastMove,
  arrows = [],
  highlights = [],
  marks = [],
  hint = [],
  flash,
  coordinates,
  className,
  label,
}: Props) {
  const s = useSettings();
  const reduced = useReducedMotion();
  const flip = orientation === 'b';
  const boardRef = useRef<HTMLDivElement>(null);
  const boardDef = BOARDS.find((b) => b.id === s.board) ?? BOARDS[0];
  const pieceDef = PIECE_SETS.find((p) => p.id === s.pieces) ?? PIECE_SETS[0];
  const showCoords = coordinates ?? s.coordinates;

  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);
  const turn = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const canMove = !!onMove && movable !== false && (movable === 'both' || movable === turn);

  // ---- piece identity / animation
  const prevRef = useRef<PlacedPiece[]>([]);
  const pieces = useMemo(() => matchPieces(prevRef.current, parsePlacement(fen), lastMove), [fen]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    prevRef.current = pieces;
  }, [pieces]);
  // Captured pieces stay in the DOM for one fade-out animation (see .piece.dying).
  const visible = pieces;

  // ---- selection and dragging
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ sq: string; x: number; y: number; active: boolean; startX: number; startY: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null);
  const [userArrows, setUserArrows] = useState<Arrow[]>([]);
  const [userCircles, setUserCircles] = useState<string[]>([]);
  const rightStart = useRef<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setPromo(null);
    setUserArrows([]);
    setUserCircles([]);
  }, [fen]);

  const legalFrom = useMemo(() => {
    const map = new Map<string, { to: string; promotion?: string; captured?: string }[]>();
    if (!chess || !canMove) return map;
    for (const m of chess.moves({ verbose: true })) {
      if (movable !== 'both' && m.color !== movable) continue;
      const list = map.get(m.from) ?? [];
      list.push({ to: m.to, promotion: m.promotion, captured: m.captured });
      map.set(m.from, list);
    }
    return map;
  }, [chess, canMove, movable]);

  const dests = selected ? legalFrom.get(selected) ?? [] : [];

  const squareFromPoint = (clientX: number, clientY: number) => {
    const el = boardRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = Math.floor(((clientX - r.left) / r.width) * 8);
    const y = Math.floor(((clientY - r.top) / r.height) * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return null;
    return xyToSq(x, y, flip);
  };

  const tryMove = (from: string, to: string) => {
    const options = (legalFrom.get(from) ?? []).filter((d) => d.to === to);
    if (!options.length) return false;
    if (options.some((o) => o.promotion)) {
      if (s.autoQueen) onMove?.({ from, to, promotion: 'q' });
      else setPromo({ from, to });
    } else onMove?.({ from, to });
    setSelected(null);
    return true;
  };

  const ownPieceAt = (sq: string) => {
    const p = chess?.get(sq as Square);
    return !!p && legalFrom.has(sq);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (promo) return;
    const sq = squareFromPoint(e.clientX, e.clientY);
    if (!sq) return;
    if (e.button === 2) {
      rightStart.current = sq;
      return;
    }
    if (e.button !== 0) return;
    if (userArrows.length || userCircles.length) {
      setUserArrows([]);
      setUserCircles([]);
    }
    if (onSquareClick) {
      onSquareClick(sq);
      return;
    }
    if (!canMove) return;
    if (selected && selected !== sq && dests.some((d) => d.to === sq)) {
      tryMove(selected, sq);
      return;
    }
    if (ownPieceAt(sq)) {
      setSelected(sq);
      boardRef.current?.setPointerCapture?.(e.pointerId);
      setDrag({ sq, x: e.clientX, y: e.clientY, active: false, startX: e.clientX, startY: e.clientY });
    } else setSelected(null);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 5;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, active: drag.active || moved });
    if (drag.active || moved) setHover(squareFromPoint(e.clientX, e.clientY));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.button === 2 && rightStart.current) {
      const end = squareFromPoint(e.clientX, e.clientY);
      const start = rightStart.current;
      rightStart.current = null;
      if (!end) return;
      if (end === start) setUserCircles((c) => (c.includes(end) ? c.filter((x) => x !== end) : [...c, end]));
      else
        setUserArrows((a) =>
          a.some((x) => x.from === start && x.to === end) ? a.filter((x) => !(x.from === start && x.to === end)) : [...a, { from: start, to: end, color: 'green' }],
        );
      return;
    }
    if (!drag) return;
    const target = squareFromPoint(e.clientX, e.clientY);
    const wasActive = drag.active;
    setDrag(null);
    setHover(null);
    if (wasActive && target && target !== drag.sq) {
      if (!tryMove(drag.sq, target)) setSelected(null);
    }
  };

  // ---- derived visuals
  const checkSq = useMemo(() => {
    if (!chess || !chess.inCheck()) return null;
    for (const row of chess.board()) for (const p of row) if (p && p.type === 'k' && p.color === chess.turn()) return p.square;
    return null;
  }, [chess]);

  const moveMs = reduced ? 0 : s.animation === 'fast' ? 110 : s.animation === 'slow' ? 320 : 200;
  const style = {
    '--sq-light': boardDef.light,
    '--sq-dark': boardDef.dark,
    '--sq-last': boardDef.last,
    '--sq-select': boardDef.select,
    '--pw-fill': pieceDef.vars.wFill,
    '--pw-line': pieceDef.vars.wLine,
    '--pb-fill': pieceDef.vars.bFill,
    '--pb-line': pieceDef.vars.bLine,
    '--move-ms': `${moveMs}ms`,
  } as CSSProperties;

  const squares = [];
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const sq = xyToSq(x, y, flip);
      const light = (FILES.indexOf(sq[0]) + Number(sq[1])) % 2 === 1;
      const cls = ['sq', light ? 'light' : 'dark'];
      if (lastMove && (lastMove[0] === sq || lastMove[1] === sq)) cls.push('last');
      if (selected === sq) cls.push('selected');
      if (highlights.includes(sq)) cls.push('hl');
      if (userCircles.includes(sq)) cls.push('circled');
      if (hover === sq && drag?.active) cls.push('hover');
      if (hint.includes(sq)) cls.push('hinted');
      if (checkSq === sq) cls.push('check');
      const dest = dests.find((d) => d.to === sq);
      squares.push(
        <div key={sq} className={cls.join(' ')} data-sq={sq}>
          {showCoords && x === 0 && <span className="coord rank">{sq[1]}</span>}
          {showCoords && y === 7 && <span className="coord file">{sq[0]}</span>}
          {dest && s.legalDots && <span className={dest.captured || chess?.get(sq as Square) ? 'dot capture' : 'dot'} />}
          {flash && flash.square === sq && <span key={flash.key} className={`flash ${flash.tone}`} />}
        </div>,
      );
    }

  const allArrows = [...arrows, ...userArrows];

  return (
    <div
      className={`board-wrap ${className ?? ''}`}
      style={style}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={label ?? `Chess board, ${turn === 'w' ? 'White' : 'Black'} to move`}
      role="img"
    >
      <div
        ref={boardRef}
        className={`board${canMove ? ' interactive' : ''}${onSquareClick ? ' clickable' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          setDrag(null);
          setHover(null);
        }}
      >
        <div className="squares">{squares}</div>
        <div className="pieces">
          {visible.map((p) => {
            const { x, y } = sqToXY(p.sq, flip);
            const dragging = drag?.active && drag.sq === p.sq && !p.dying;
            let transform = `translate(${x * 100}%, ${y * 100}%)`;
            if (dragging && boardRef.current) {
              const r = boardRef.current.getBoundingClientRect();
              const size = r.width / 8;
              transform = `translate(${drag!.x - r.left - size / 2}px, ${drag!.y - r.top - size / 2}px) scale(1.12)`;
            }
            return (
              <div
                key={p.id}
                className={`piece${p.dying ? ' dying' : ''}${dragging ? ' dragging' : ''}${selected === p.sq && !dragging ? ' lifted' : ''}`}
                style={{ transform }}
              >
                <svg viewBox="0 0 40 40" dangerouslySetInnerHTML={{ __html: PIECE_SVG[p.code] }} />
              </div>
            );
          })}
        </div>
        {marks.length > 0 && (
          <div className="marks">
            {marks.map((m) => {
              const { x, y } = sqToXY(m.square, flip);
              return (
                <span key={m.square + m.kind} className={`mark mark-${m.kind}`} style={{ left: `${(x + 1) * 12.5}%`, top: `${y * 12.5}%` }}>
                  {MARK_GLYPH[m.kind]}
                </span>
              );
            })}
          </div>
        )}
        {allArrows.length > 0 && <ArrowLayer arrows={allArrows} flip={flip} />}
        {promo && (
          <PromotionPicker
            color={turn}
            file={sqToXY(promo.to, flip).x}
            top={sqToXY(promo.to, flip).y === 0}
            onPick={(p) => {
              onMove?.({ from: promo.from, to: promo.to, promotion: p });
              setPromo(null);
            }}
            onCancel={() => setPromo(null)}
          />
        )}
      </div>
    </div>
  );
}

const ARROW_COLORS: Record<string, string> = {
  green: 'rgba(21, 160, 80, 0.82)',
  red: 'rgba(220, 50, 50, 0.82)',
  blue: 'rgba(40, 110, 230, 0.8)',
  gold: 'rgba(235, 165, 20, 0.88)',
};

function ArrowLayer({ arrows, flip }: { arrows: Arrow[]; flip: boolean }) {
  return (
    <svg className="arrows" viewBox="0 0 8 8" aria-hidden="true">
      <defs>
        {Object.entries(ARROW_COLORS).map(([k, c]) => (
          <marker key={k} id={`ah-${k}`} viewBox="0 0 10 10" refX="5.5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto">
            <path d="M0 0L10 5L0 10z" fill={c} />
          </marker>
        ))}
      </defs>
      {arrows.map((a, i) => {
        const f = sqToXY(a.from, flip);
        const t = sqToXY(a.to, flip);
        const x1 = f.x + 0.5;
        const y1 = f.y + 0.5;
        const x2 = t.x + 0.5;
        const y2 = t.y + 0.5;
        const len = Math.hypot(x2 - x1, y2 - y1);
        const k = (len - 0.42) / len;
        const color = a.color ?? 'green';
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * k}
            y2={y1 + (y2 - y1) * k}
            stroke={ARROW_COLORS[color]}
            strokeWidth="0.17"
            strokeLinecap="round"
            markerEnd={`url(#ah-${color})`}
          />
        );
      })}
    </svg>
  );
}

function PromotionPicker({ color, file, top, onPick, onCancel }: { color: 'w' | 'b'; file: number; top: boolean; onPick: (p: string) => void; onCancel: () => void }) {
  const order = ['q', 'n', 'r', 'b'];
  return (
    <div className="promo-backdrop" onPointerDown={(e) => { e.stopPropagation(); onCancel(); }}>
      <div className={`promo ${top ? 'top' : 'bottom'}`} style={{ left: `${file * 12.5}%` }} onPointerDown={(e) => e.stopPropagation()}>
        {order.map((p) => (
          <button key={p} type="button" className="promo-choice" onClick={() => onPick(p)} aria-label={`Promote to ${{ q: 'queen', n: 'knight', r: 'rook', b: 'bishop' }[p]}`}>
            <svg viewBox="0 0 40 40" dangerouslySetInnerHTML={{ __html: PIECE_SVG[color + p] }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** A piece glyph for UI chrome (move lists, captured pieces, module badges). */
export function PieceGlyph({ code, size = 22, className }: { code: string; size?: number; className?: string }) {
  const s = useSettings();
  const def = PIECE_SETS.find((p) => p.id === s.pieces) ?? PIECE_SETS[0];
  const style = {
    width: size,
    height: size,
    '--pw-fill': def.vars.wFill,
    '--pw-line': def.vars.wLine,
    '--pb-fill': def.vars.bFill,
    '--pb-line': def.vars.bLine,
  } as CSSProperties;
  return <svg className={`piece-glyph ${className ?? ''}`} style={style} viewBox="0 0 40 40" dangerouslySetInnerHTML={{ __html: PIECE_SVG[code] }} aria-hidden="true" />;
}
