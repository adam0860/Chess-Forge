// Generates tactical puzzles from imperfect Stockfish self-play.
//   node tools/gen-puzzles.mjs <outfile.jsonl> <minutes> <seed>
// A position becomes a puzzle when the opponent's last move was a blunder and the
// side to move then has exactly one winning continuation, verified at depth 16.
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { Engine, scoreToCp } from './engine-node.mjs';

const [, , outFile = 'tools/out/puzzles.jsonl', minutesArg = '60', seedArg = '1'] = process.argv;
const deadline = Date.now() + Number(minutesArg) * 60_000;
let seed = Number(seedArg) >>> 0;
const rnd = () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
function material(chess, color) {
  let s = 0;
  for (const row of chess.board()) for (const sq of row) if (sq && sq.color === color) s += VAL[sq.type];
  return s;
}
const uciObj = (u) => ({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
const key = (fen) => fen.split(' ').slice(0, 2).join(' ');

// Mode "hard" plays stronger games and keeps few trivial one-movers.
const HARD = process.argv[5] === 'hard';
const RANDOM = HARD ? 0.008 : 0.03;
const THIRD = HARD ? 0.06 : 0.1;
const SECOND = HARD ? 0.2 : 0.26;
const seen = new Set();
if (existsSync(outFile)) for (const l of readFileSync(outFile, 'utf8').split('\n')) if (l) seen.add(key(JSON.parse(l).fen));

const eng = new Engine();
let games = 0;
let found = 0;

function pickMove(lines, legal, ply) {
  // Opening variety: wider choice early on.
  const r = rnd();
  if (ply < 8) return lines[Math.floor(rnd() * Math.min(lines.length, 3))].move;
  if (r < RANDOM) {
    const m = legal[Math.floor(rnd() * legal.length)];
    return m.from + m.to + (m.promotion ?? '');
  }
  if (r < THIRD && lines[2]) return lines[2].move;
  if (r < SECOND && lines[1]) return lines[1].move;
  return lines[0].move;
}

async function uniqueBest(fen, depth) {
  const { lines, history } = await eng.analyze(fen, { depth, multipv: 2 });
  if (!lines.length) return null;
  const s1 = lines[0].score;
  const s2 = lines[1]?.score;
  const c1 = scoreToCp(s1);
  const c2 = s2 ? scoreToCp(s2) : -100000;
  return { move: lines[0].move, s1, s2, c1, c2, gap: c1 - c2, history, pv: lines[0].pv };
}

async function tryPuzzle(prevFen, blunder, fen, side) {
  const first = await uniqueBest(fen, 16);
  if (!first) return null;
  const isMate = first.s1.mate != null && first.s1.mate > 0;
  if (isMate) {
    if (first.s1.mate > 5) return null;
    if (first.s2 && first.s2.mate != null && first.s2.mate > 0) return null; // two ways to mate
  } else if (first.c1 < 250 || first.gap < 220) return null;

  const chess = new Chess(fen);
  const solution = [first.move];
  chess.move(uciObj(first.move));
  const startDiff = (() => {
    const c = new Chess(fen);
    return material(c, side) - material(c, side === 'w' ? 'b' : 'w');
  })();
  let playerMoves = 1;
  while (!chess.isGameOver() && playerMoves < (isMate ? 5 : 4)) {
    const reply = (await eng.analyze(chess.fen(), { depth: 14, multipv: 1 })).lines[0];
    if (!reply) break;
    const before = chess.fen();
    chess.move(uciObj(reply.move));
    const next = await uniqueBest(chess.fen(), 14);
    if (!next) {
      chess.load(before);
      break;
    }
    const mateNext = next.s1.mate != null && next.s1.mate > 0;
    const lastMate = mateNext && next.s1.mate === 1;
    const unique = isMate ? mateNext && (lastMate || !(next.s2 && next.s2.mate != null && next.s2.mate > 0)) : next.c1 >= 200 && next.gap >= 200;
    if (!unique) {
      chess.load(before);
      break;
    }
    solution.push(reply.move, next.move);
    chess.move(uciObj(next.move));
    playerMoves++;
  }
  if (isMate && !chess.isCheckmate()) return null;
  if (!isMate) {
    // The gain must be real: material after the opponent's best reply.
    const after = new Chess(chess.fen());
    if (!after.isGameOver()) {
      const r = (await eng.analyze(after.fen(), { depth: 12, multipv: 1 })).lines[0];
      if (r) after.move(uciObj(r.move));
    }
    const endDiff = material(after, side) - material(after, side === 'w' ? 'b' : 'w');
    if (endDiff - startDiff < 2) return null;
    const check = await eng.analyze(after.fen(), { depth: 12, multipv: 1 });
    const cpForSide = scoreToCp(check.lines[0]?.score) * (after.turn() === side ? 1 : -1);
    if (cpForSide < 200) return null;
  }
  // Depth from which the engine consistently prefers the solution move.
  let depthFound = 16;
  for (let i = first.history.length - 1; i >= 0; i--) {
    if (first.history[i].move !== first.move) break;
    depthFound = first.history[i].depth;
  }
  return { fen: prevFen, moves: [blunder, ...solution], mate: isMate ? first.s1.mate : null, depthFound, eval: isMate ? null : first.c1 };
}

async function playGame() {
  await eng.newGame();
  const chess = new Chess();
  let prev = null; // { fen, cp (from side to move), move }
  for (let ply = 0; ply < 150 && !chess.isGameOver(); ply++) {
    const fen = chess.fen();
    const { lines } = await eng.analyze(fen, { depth: 9, multipv: 3 });
    if (!lines.length) break;
    const side = chess.turn();
    const c1 = scoreToCp(lines[0].score);
    const c2 = lines[1] ? scoreToCp(lines[1].score) : -100000;
    if (prev && ply > 10 && !seen.has(key(fen))) {
      const before = -prev.cp; // our eval before the opponent moved
      const mateNow = lines[0].score.mate != null && lines[0].score.mate > 0;
      const candidate = before < 150 && ((mateNow && lines[0].score.mate <= 5) || (c1 >= 220 && c1 - c2 >= 200 && c1 - before >= 200));
      if (candidate) {
        const p = await tryPuzzle(prev.fen, prev.move, fen, side);
        const trivial = p && !p.mate && p.moves.length === 2 && p.depthFound <= 3;
        if (p && !(HARD && trivial && rnd() > 0.1)) {
          seen.add(key(fen));
          appendFileSync(outFile, JSON.stringify(p) + '\n');
          found++;
        }
      }
    }
    if (Math.abs(c1) > 2500 && ply > 30 && rnd() < 0.5) break; // decided game
    const move = pickMove(lines, chess.moves({ verbose: true }), ply);
    prev = { fen, cp: c1, move };
    chess.move(uciObj(move));
  }
  games++;
}

while (Date.now() < deadline) {
  try {
    await playGame();
  } catch (e) {
    console.error('game failed', e?.message);
  }
  if (games % 5 === 0) console.log(`${new Date().toISOString()} games=${games} puzzles=${found}`);
}
eng.quit();
console.log(`done games=${games} puzzles=${found}`);
process.exit(0);
