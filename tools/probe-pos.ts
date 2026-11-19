// npx tsx tools/probe-pos.ts "<FEN or piece list>" [depth] [multipv]
import { Chess } from 'chess.js';
import { toFen } from '../src/lib/line';
// @ts-expect-error js helper
import { Engine, scoreToCp } from './engine-node.mjs';
const [, , spec, depth = '18', mpv = '3'] = process.argv;
const fen = toFen(spec);
const c = new Chess(fen);
console.log(fen);
const e = new Engine();
const r = await e.analyze(fen, { depth: Number(depth), multipv: Number(mpv) });
const sign = c.turn() === 'w' ? 1 : -1;
for (const l of r.lines) {
  const t = new Chess(fen);
  const sans: string[] = [];
  for (const u of l.pv.slice(0, 9)) { try { sans.push(t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
  const sc = l.score.mate != null ? `M${l.score.mate * sign}` : ((scoreToCp(l.score) * sign) / 100).toFixed(2);
  console.log(String(sc).padStart(7), sans.join(' '));
}
e.quit(); process.exit(0);
