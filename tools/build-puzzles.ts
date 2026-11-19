/*
 * Turns raw generated puzzles (tools/out/*.jsonl) into src/content/puzzles.json:
 * deduplicates, detects tactical themes, and estimates a difficulty rating.
 *   npx tsx tools/build-puzzles.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';

interface Raw {
  fen: string;
  moves: string[];
  mate: number | null;
  depthFound: number;
  eval: number | null;
}

const VAL: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const FILES = 'abcdefgh';
const sq = (f: number, r: number) => (FILES[f] + (r + 1)) as Square;
const coords = (s: string) => [FILES.indexOf(s[0]), Number(s[1]) - 1];
const opp = (c: Color): Color => (c === 'w' ? 'b' : 'w');
const mv = (u: string) => ({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });

function material(c: Chess, color: Color) {
  let s = 0;
  for (const row of c.board()) for (const p of row) if (p && p.color === color && p.type !== 'k') s += VAL[p.type];
  return s;
}

/** Squares a piece on `from` attacks in the current position. */
function attacksFrom(c: Chess, from: Square): Square[] {
  const p = c.get(from);
  if (!p) return [];
  const out: Square[] = [];
  for (const row of c.board())
    for (const t of row) {
      if (!t) continue;
      const s = t.square;
      if (t.color !== p.color && c.attackers(s, p.color).includes(from)) out.push(s);
    }
  return out;
}

const DIRS: Record<string, [number, number][]> = {
  b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
  r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
  q: [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]],
};

/** Pieces along each ray from a slider: [first piece, second piece]. */
function rays(c: Chess, from: Square) {
  const p = c.get(from);
  if (!p || !DIRS[p.type]) return [];
  const [f0, r0] = coords(from);
  const res: { first: { sq: Square; type: PieceSymbol; color: Color }; second?: { sq: Square; type: PieceSymbol; color: Color } }[] = [];
  for (const [df, dr] of DIRS[p.type]) {
    let f = f0 + df;
    let r = r0 + dr;
    const found: { sq: Square; type: PieceSymbol; color: Color }[] = [];
    while (f >= 0 && f < 8 && r >= 0 && r < 8 && found.length < 2) {
      const t = c.get(sq(f, r));
      if (t) found.push({ sq: sq(f, r), type: t.type, color: t.color });
      f += df;
      r += dr;
    }
    if (found[0]) res.push({ first: found[0], second: found[1] });
  }
  return res;
}

function themesFor(raw: Raw): { themes: string[]; playerMoves: number; sacrifice: boolean; quiet: boolean } {
  const c = new Chess(raw.fen);
  c.move(mv(raw.moves[0]));
  const me = c.turn();
  const themes = new Set<string>();
  const startBal = material(c, me) - material(c, opp(me));
  let sacrifice = false;
  let quiet = false;
  const sol = raw.moves.slice(1);
  const playerMoves = Math.ceil(sol.length / 2);
  for (let i = 0; i < sol.length; i++) {
    const before = new Chess(c.fen());
    const m = c.move(mv(sol[i]));
    if (i % 2 === 1) {
      // After the opponent's reply to our first move: did we give material?
      if (i === 1 && material(c, me) - material(c, opp(me)) <= startBal - 2) sacrifice = true;
      continue;
    }
    if (m.promotion) themes.add('promotion');
    if (i === 0) {
      quiet = !m.captured && !m.san.includes('+');
      if (m.captured && playerMoves === 1 && !c.isAttacked(m.to, opp(me))) themes.add('hangingPiece');
    }
    const isLast = i === sol.length - 1;
    if (isLast && c.isCheckmate()) continue;
    // Fork: the moved piece attacks two valuable targets.
    const targets = attacksFrom(c, m.to).filter((s) => {
      const t = c.get(s)!;
      return t.type === 'k' || VAL[t.type] > VAL[m.piece] || (VAL[t.type] >= 3 && !c.isAttacked(s, opp(me)));
    });
    if (targets.length >= 2 && !c.isAttacked(m.to, opp(me))) themes.add('fork');
    else if (targets.length >= 2 && m.piece === 'n') themes.add('fork');
    // Pin and skewer made by the moved slider.
    for (const ray of rays(c, m.to)) {
      const { first, second } = ray;
      if (first.color === me || !second || second.color === me) continue;
      if (VAL[second.type] > VAL[first.type] && second.type !== 'p' && first.type !== 'k') themes.add('pin');
      if ((first.type === 'k' || first.type === 'q') && VAL[second.type] < VAL[first.type] && VAL[second.type] >= 3) themes.add('skewer');
    }
    // Discovered attack: another slider of ours gains a valuable target.
    for (const row of c.board())
      for (const t of row) {
        if (!t || t.color !== me || t.square === m.to || !DIRS[t.type]) continue;
        const now = attacksFrom(c, t.square).filter((s) => {
          const x = c.get(s)!;
          return x.type === 'k' || VAL[x.type] >= 5;
        });
        const was = new Set(attacksFrom(before, t.square));
        if (now.some((s) => !was.has(s))) themes.add('discoveredAttack');
      }
  }
  if (c.isCheckmate()) {
    themes.add('mate');
    themes.add(`mateIn${playerMoves}`);
    const kSq = c.board().flat().find((p) => p && p.type === 'k' && p.color === opp(me))!.square;
    const backRank = opp(me) === 'w' ? '1' : '8';
    const last = c.history({ verbose: true }).at(-1)!;
    if (kSq[1] === backRank && (last.piece === 'r' || last.piece === 'q') && last.to[1] === backRank) themes.add('backRankMate');
    if (last.piece === 'n') {
      const [kf, kr] = coords(kSq);
      let boxed = true;
      for (let df = -1; df <= 1; df++)
        for (let dr = -1; dr <= 1; dr++) {
          if (!df && !dr) continue;
          const f = kf + df;
          const r = kr + dr;
          if (f < 0 || f > 7 || r < 0 || r > 7) continue;
          const t = c.get(sq(f, r));
          if (!t || t.color !== opp(me)) boxed = false;
        }
      if (boxed) themes.add('smotheredMate');
    }
  }
  if (sacrifice) themes.add('sacrifice');
  const pieces = new Chess(raw.fen).board().flat().filter((p) => p && p.type !== 'k' && p.type !== 'p').length;
  if (pieces <= 4) themes.add('endgame');
  else themes.add('middlegame');
  if (playerMoves === 1) themes.add('oneMove');
  if (playerMoves >= 3) themes.add('long');
  return { themes: [...themes], playerMoves, sacrifice, quiet };
}

function rating(raw: Raw, info: ReturnType<typeof themesFor>): number {
  let r = 560 + raw.depthFound * 75 + (info.playerMoves - 1) * 170;
  if (info.sacrifice) r += 200;
  if (info.quiet) r += 220;
  if (info.themes.includes('hangingPiece')) r -= 220;
  if (info.themes.includes('mateIn1')) r -= 80;
  if (info.themes.includes('discoveredAttack')) r += 60;
  return Math.max(400, Math.min(2400, Math.round(r / 10) * 10));
}

const dir = 'tools/out';
const seen = new Set<string>();
const out: { id: string; fen: string; moves: string[]; rating: number; themes: string[] }[] = [];
// Simple one-move captures are useful for beginners, but cap them so the set stays varied.
const MAX_TRIVIAL = 170;
let trivial = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl')).sort()) {
  for (const line of readFileSync(`${dir}/${f}`, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const raw = JSON.parse(line) as Raw;
    const key = raw.fen.split(' ').slice(0, 2).join(' ') + raw.moves[0];
    if (seen.has(key)) continue;
    seen.add(key);
    const isTrivial = raw.mate == null && raw.moves.length === 2 && raw.depthFound <= 3;
    if (isTrivial && ++trivial > MAX_TRIVIAL) continue;
    try {
      const info = themesFor(raw);
      out.push({ id: '', fen: raw.fen, moves: raw.moves, rating: rating(raw, info), themes: info.themes.sort() });
    } catch (e) {
      console.warn('skip', (e as Error).message);
    }
  }
}
out.sort((a, b) => a.rating - b.rating || a.fen.localeCompare(b.fen));
// Spread ratings by difficulty rank so the set covers 500–2200 evenly.
out.forEach((p, i) => (p.rating = Math.round((500 + 1700 * Math.pow(i / Math.max(1, out.length - 1), 1.15)) / 10) * 10));
out.forEach((p, i) => (p.id = `p${String(i + 1).padStart(4, '0')}`));
writeFileSync('src/content/puzzles.json', JSON.stringify(out));
const counts: Record<string, number> = {};
for (const p of out) for (const t of p.themes) counts[t] = (counts[t] ?? 0) + 1;
const buckets: Record<string, number> = {};
for (const p of out) {
  const b = `${Math.floor(p.rating / 200) * 200}`;
  buckets[b] = (buckets[b] ?? 0) + 1;
}
console.log(`${out.length} puzzles`);
console.log('themes', counts);
console.log('ratings', buckets);
