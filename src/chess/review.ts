import { Chess, type Move } from 'chess.js';
import { OPENINGS } from '../content/openings';
import { replay, START_FEN, uciToSan } from '../lib/line';
import type { ReviewMove, ReviewSummary } from '../lib/store';
import { engine, scoreCp } from './engine';
import { sfx } from '../lib/sound';
import { haptic } from '../lib/platform';

/** Win probability (0–100) for White from a centipawn score (Lichess’ model). */
export function winPct(cpWhite: number): number {
  const cp = Math.max(-1500, Math.min(1500, cpWhite));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export function classify(lossPct: number, isBest: boolean): ReviewMove['cls'] {
  if (isBest) return 'best';
  if (lossPct >= 30) return 'blunder';
  if (lossPct >= 20) return 'mistake';
  if (lossPct >= 10) return 'inaccuracy';
  return 'good';
}

const key = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

let bookCache: Set<string> | null = null;
/** Positions that appear in the opening library’s main lines and variations. */
export function bookPositions(): Set<string> {
  if (bookCache) return bookCache;
  const set = new Set<string>();
  for (const o of OPENINGS) {
    try {
      const main = replay(o.mainLine.line);
      main.fens.forEach((f) => set.add(key(f)));
      for (const v of o.variations) replay(v.line, main.fens[v.from]).fens.forEach((f) => set.add(key(f)));
    } catch {
      /* validated elsewhere */
    }
  }
  bookCache = set;
  return set;
}

export function cpWhiteFrom(fen: string, s: { cp?: number; mate?: number } | undefined) {
  const v = scoreCp(s);
  return fen.split(' ')[1] === 'w' ? v : -v;
}

/** Analyses every position of a game. */
export async function reviewGame(sans: string[], startFen = START_FEN, onProgress?: (done: number, total: number) => void, depth = 12): Promise<ReviewSummary> {
  const chess = new Chess(startFen);
  const fens = [chess.fen()];
  for (const san of sans) {
    chess.move(san);
    fens.push(chess.fen());
  }
  const evals: { cp: number; best: string; pv: string[] }[] = [];
  for (let i = 0; i < fens.length; i++) {
    const c = new Chess(fens[i]);
    if (c.isCheckmate()) evals.push({ cp: c.turn() === 'w' ? -100000 : 100000, best: '', pv: [] });
    else if (c.isDraw() || c.isStalemate()) evals.push({ cp: 0, best: '', pv: [] });
    else {
      const r = await engine.analyze(fens[i], { depth });
      const l = r.lines[0];
      evals.push({ cp: cpWhiteFrom(fens[i], l?.score), best: l?.move ?? r.bestmove, pv: l?.pv ?? [] });
    }
    onProgress?.(i + 1, fens.length);
  }
  const book = bookPositions();
  const moves: ReviewMove[] = [];
  const losses: { w: number[]; b: number[] } = { w: [], b: [] };
  const counts: Record<string, number> = {};
  for (let i = 0; i < sans.length; i++) {
    const mover = fens[i].split(' ')[1] as 'w' | 'b';
    const before = evals[i];
    const after = evals[i + 1];
    const wb = winPct(before.cp);
    const wa = winPct(after.cp);
    const loss = Math.max(0, mover === 'w' ? wb - wa : wa - wb);
    const playedUci = (() => {
      const c = new Chess(fens[i]);
      const m = c.move(sans[i]);
      return m.from + m.to + (m.promotion ?? '');
    })();
    let cls = classify(loss, playedUci === before.best);
    if (i < 24 && book.has(key(fens[i + 1])) && cls !== 'blunder') cls = 'book';
    counts[cls] = (counts[cls] ?? 0) + 1;
    losses[mover].push(loss);
    const pvSan: string[] = [];
    const t = new Chess(fens[i]);
    for (const u of before.pv.slice(0, 6)) {
      try {
        pvSan.push(t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
      } catch {
        break;
      }
    }
    moves.push({ ply: i, san: sans[i], best: before.best ? uciToSan(fens[i], before.best) : '', cpBefore: before.cp, cpAfter: after.cp, cls, pv: pvSan });
  }
  const acc = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((s, l) => s + Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * l) - 3.1669)), 0) / arr.length) : 0;
  return { moves, accuracy: { w: acc(losses.w), b: acc(losses.b) }, counts };
}

/** A short, plain-language reason for a mistake. */
export function explainMistake(m: ReviewMove, fenBefore: string): string {
  const mover = fenBefore.split(' ')[1] as 'w' | 'b';
  const sign = mover === 'w' ? 1 : -1;
  const after = m.cpAfter * sign;
  const before = m.cpBefore * sign;
  if (after <= -90000) return `This allows a forced checkmate. ${m.best} was necessary.`;
  if (before >= 90000 && after < 90000) return `You had a forced checkmate starting with ${m.best}.`;
  // Did the better move win material?
  try {
    const c = new Chess(fenBefore);
    const bestMove = c.move(m.best);
    if (bestMove.captured) return `${m.best} wins material: it captures a ${pieceName(bestMove.captured)}.`;
    if (bestMove.san.includes('+')) return `${m.best} is a strong check that keeps the initiative.`;
  } catch {
    /* ignore */
  }
  const drop = (before - after) / 100;
  if (drop >= 3) return `This loses material. The engine prefers ${m.best}.`;
  return `This lets your advantage slip by about ${drop.toFixed(1)} pawns. ${m.best} was more accurate.`;
}

const pieceName = (p: string) => ({ p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' })[p] ?? 'piece';

/** Plays the right sound (and haptic) for a move. */
export function moveFeedback(m: Move | { san: string; captured?: string; flags?: string }) {
  if (m.san.includes('#')) {
    sfx.check();
    void haptic('success');
  } else if (m.san.includes('+')) {
    sfx.check();
    void haptic('medium');
  } else if (m.san.startsWith('O-O')) sfx.castle();
  else if (m.captured) {
    sfx.capture();
    void haptic('light');
  } else sfx.move();
}
