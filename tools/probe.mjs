// node tools/probe.mjs "<line>" [depth] [multipv]  — prints engine top moves after a line
import { Chess } from 'chess.js';
import { Engine, scoreToCp } from './engine-node.mjs';
const [, , line = '', depth = '18', mpv = '4'] = process.argv;
const c = new Chess();
for (const t of line.split(/\s+/).filter((x) => x && !/^\d+\.+$/.test(x))) c.move(t.replace(/^\d+\.+/, ''));
const e = new Engine();
const r = await e.analyze(c.fen(), { depth: Number(depth), multipv: Number(mpv) });
const sign = c.turn() === 'w' ? 1 : -1;
for (const l of r.lines) {
  const t = new Chess(c.fen());
  const sans = [];
  for (const u of l.pv.slice(0, 8)) { try { sans.push(t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } }
  console.log(((scoreToCp(l.score) * sign) / 100).toFixed(2).padStart(7), sans.join(' '));
}
e.quit(); process.exit(0);
