import { Chess, type Move } from 'chess.js';
import type { LineMove } from '../content/types';

/*
 * Parsing and replaying move lines written as "1. e4 {comment} e5 2. Nf3 …",
 * and building positions from compact piece lists.
 */

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const FEN_RE = /^[1-8pnbrqkPNBRQK]+(\/[1-8pnbrqkPNBRQK]+){7}\s/;

/** Parses "1. e4 {note} e5 2. Nf3 …" into moves. Move numbers and ellipses are ignored. */
export function parseLine(text: string): LineMove[] {
  const out: LineMove[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '{') {
      const end = text.indexOf('}', i);
      const note = text.slice(i + 1, end === -1 ? undefined : end).trim();
      if (out.length) out[out.length - 1].note = out[out.length - 1].note ? `${out[out.length - 1].note} ${note}` : note;
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    let j = i;
    while (j < text.length && !/[\s{]/.test(text[j])) j++;
    const tok = text.slice(i, j);
    i = j;
    if (/^\d+\.+$/.test(tok) || /^\.+$/.test(tok)) continue;
    const san = tok.replace(/^\d+\.+/, '');
    if (san) out.push({ san });
  }
  return out;
}

/**
 * Builds a FEN from either a FEN or a piece list:
 *   "W: Kg1 Rf1 f2 g2 h2; B: Kg8 Re8 f7 g7 h7; b"
 * A square with no piece letter is a pawn. The trailing w/b is the side to move (default w).
 */
export function toFen(spec?: string): string {
  if (!spec) return START_FEN;
  const s = spec.trim();
  if (FEN_RE.test(s + ' ')) {
    const parts = s.split(/\s+/);
    while (parts.length < 6) parts.push(['w', '-', '-', '0', '1'][parts.length - 1]);
    return parts.slice(0, 6).join(' ');
  }
  const grid: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  let turn = 'w';
  for (const chunk of s.split(';')) {
    const c = chunk.trim();
    if (!c) continue;
    if (c === 'w' || c === 'b') {
      turn = c;
      continue;
    }
    const m = c.match(/^([WB])\s*:\s*(.*)$/i);
    if (!m) throw new Error(`Bad piece list chunk: "${c}"`);
    const white = m[1].toUpperCase() === 'W';
    for (const tok of m[2].split(/[\s,]+/).filter(Boolean)) {
      const t = tok.match(/^([KQRBNP]?)([a-h][1-8])$/);
      if (!t) throw new Error(`Bad piece token: "${tok}"`);
      const letter = t[1] || 'P';
      const file = t[2].charCodeAt(0) - 97;
      const rank = Number(t[2][1]);
      grid[8 - rank][file] = white ? letter : letter.toLowerCase();
    }
  }
  const rows = grid.map((row) => {
    let r = '';
    let empty = 0;
    for (const p of row) {
      if (!p) empty++;
      else {
        if (empty) r += empty;
        empty = 0;
        r += p;
      }
    }
    return r + (empty ? empty : '');
  });
  return `${rows.join('/')} ${turn} - - 0 1`;
}

export interface Replayed {
  fens: string[]; // fens[0] = start, fens[i] = after move i
  moves: Move[];
  notes: (string | undefined)[];
}

/** Replays a line from a position. Throws on an illegal move (caught by the validator). */
export function replay(line: string | LineMove[], fen: string = START_FEN): Replayed {
  const moves = typeof line === 'string' ? parseLine(line) : line;
  const chess = new Chess(fen);
  const out: Replayed = { fens: [chess.fen()], moves: [], notes: [] };
  for (const m of moves) {
    const san = m.san.split('|')[0];
    let mv: Move;
    try {
      mv = chess.move(san);
    } catch {
      throw new Error(`Illegal move "${san}" after ${out.moves.map((x) => x.san).join(' ') || 'the start'} (${chess.fen()})`);
    }
    out.moves.push(mv);
    out.notes.push(m.note);
    out.fens.push(chess.fen());
  }
  return out;
}

/** Formats moves as "1. e4 e5 2. Nf3" starting from a given ply. */
export function formatMoves(sans: string[], startPly = 0): string {
  let s = '';
  sans.forEach((san, i) => {
    const ply = startPly + i;
    if (ply % 2 === 0) s += `${ply / 2 + 1}. `;
    else if (i === 0) s += `${Math.floor(ply / 2) + 1}… `;
    s += san + ' ';
  });
  return s.trim();
}

export function moveNumberLabel(ply: number): string {
  return ply % 2 === 0 ? `${ply / 2 + 1}.` : `${Math.floor(ply / 2) + 1}…`;
}

export const uciOf = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion ?? '');
export const fromUci = (u: string) => ({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined });

/** Plays a UCI move on a copy of the position and returns its SAN (or the UCI if illegal). */
export function uciToSan(fen: string, uci: string): string {
  try {
    const c = new Chess(fen);
    return c.move(fromUci(uci)).san;
  } catch {
    return uci;
  }
}

export function sideToMove(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

const VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
export function materialBalance(fen: string): number {
  const board = fen.split(' ')[0];
  let s = 0;
  for (const ch of board) {
    const v = VALUES[ch.toLowerCase()];
    if (v === undefined) continue;
    s += ch === ch.toUpperCase() ? v : -v;
  }
  return s;
}

/** Captured pieces per side, for the material strip beside the board. */
export function capturedPieces(fen: string): { w: string[]; b: string[]; diff: number } {
  const start: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const count: Record<string, number> = {};
  for (const ch of fen.split(' ')[0]) if (/[pnbrqPNBRQ]/.test(ch)) count[ch] = (count[ch] ?? 0) + 1;
  const w: string[] = []; // black pieces White has captured
  const b: string[] = [];
  for (const t of ['q', 'r', 'b', 'n', 'p']) {
    for (let i = 0; i < Math.max(0, start[t] - (count[t] ?? 0)); i++) w.push('b' + t);
    for (let i = 0; i < Math.max(0, start[t] - (count[t.toUpperCase()] ?? 0)); i++) b.push('w' + t);
  }
  return { w, b, diff: materialBalance(fen) };
}
