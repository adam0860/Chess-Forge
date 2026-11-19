/*
 * Content validator.
 *   npx tsx scripts/validate-content.ts            legality and structure (fast; runs in CI)
 *   npx tsx scripts/validate-content.ts --engine   also asks Stockfish to check main lines,
 *                                                  traps, mistakes and every "find the move" answer
 *   … --only=<id>                                  limit to one opening or module id
 */
import { Chess } from 'chess.js';
import { OPENINGS } from '../src/content/openings';
import { MODULES } from '../src/content/curriculum';
import { PUZZLES } from '../src/content/puzzles';
import { parseLine, replay, toFen, START_FEN } from '../src/lib/line';

const args = process.argv.slice(2);
const useEngine = args.includes('--engine');
const only = args.find((a) => a.startsWith('--only='))?.slice(7);
const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);
// Lessons where a single-move answer should be clearly the only good move.
const STRICT = /^(m3|m4|m5|m9)-/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let engine: any = null;
let scoreToCp: (s: unknown) => number = () => 0;
async function getEngine() {
  if (!engine) {
    // @ts-expect-error plain JS helper outside the app bundle
    const mod = await import('../tools/engine-node.mjs');
    engine = new mod.Engine();
    scoreToCp = mod.scoreToCp;
  }
  return engine;
}

/** Eval in centipawns from White's point of view. */
async function evalWhite(fen: string, depth = 14): Promise<{ cp: number; best: string; mate: number | null }> {
  const e = await getEngine();
  const r = await e.analyze(fen, { depth, multipv: 1 });
  const line = r.lines[0];
  const cp = scoreToCp(line?.score);
  const sign = fen.split(' ')[1] === 'w' ? 1 : -1;
  return { cp: cp * sign, best: line?.move ?? '', mate: line?.score?.mate != null ? line.score.mate * sign : null };
}

function tryReplay(label: string, line: string, fen = START_FEN) {
  try {
    return replay(line, fen);
  } catch (e) {
    err(`${label}: ${(e as Error).message}`);
    return null;
  }
}

async function checkLineQuality(label: string, line: string, fen: string, threshold: number, startPly = 0) {
  const r = tryReplay(label, line, fen);
  if (!r || !useEngine) return;
  for (let i = 0; i < r.moves.length; i++) {
    const before = await evalWhite(r.fens[i], 13);
    const after = await evalWhite(r.fens[i + 1], 13);
    const mover = r.moves[i].color === 'w' ? 1 : -1;
    const loss = (before.cp - after.cp) * mover;
    if (loss > threshold && Math.abs(before.cp) < 2000) {
      const ply = startPly + i;
      warn(`${label}: ${Math.floor(ply / 2) + 1}${ply % 2 ? '…' : '.'}${r.moves[i].san} loses ~${loss}cp (engine prefers ${before.best}; ${before.cp} → ${after.cp})`);
    }
  }
}

async function validateOpenings() {
  const ids = new Set<string>();
  for (const o of OPENINGS) {
    if (only && o.id !== only) continue;
    if (ids.has(o.id)) err(`duplicate opening id ${o.id}`);
    ids.add(o.id);
    const L = `opening ${o.id}`;
    const main = tryReplay(`${L} main line`, o.mainLine.line);
    if (!main) continue;
    const mainMoves = parseLine(o.mainLine.line);
    mainMoves.forEach((m, i) => {
      if (!m.note) warn(`${L}: main-line move ${i + 1} (${m.san}) has no note`);
    });
    await checkLineQuality(`${L} main`, o.mainLine.line, START_FEN, 90);
    if (useEngine) {
      const end = await evalWhite(main.fens[main.fens.length - 1], 16);
      console.log(`  ${o.id}: main line ends at ${(end.cp / 100).toFixed(2)} (White's view)`);
    }
    for (const v of o.variations) {
      if (v.from > main.moves.length) err(`${L} variation ${v.id}: from ${v.from} beyond main line`);
      const start = main.fens[v.from];
      const r = tryReplay(`${L} variation ${v.id}`, v.line, start);
      if (r && r.moves[0] && main.moves[v.from] && r.moves[0].san === main.moves[v.from].san) err(`${L} variation ${v.id}: first move equals the main line`);
      await checkLineQuality(`${L} var ${v.id}`, v.line, start, 120, v.from);
    }
    for (const t of o.traps) {
      const r = tryReplay(`${L} trap ${t.id}`, t.line);
      if (r && useEngine) {
        const end = r.fens[r.fens.length - 1];
        const c = new Chess(end);
        if (!c.isCheckmate()) {
          const ev = await evalWhite(end, 16);
          const setter = t.side === 'you' ? (o.side === 'w' ? 1 : -1) : o.side === 'w' ? -1 : 1;
          if (ev.cp * setter < 150) warn(`${L} trap ${t.id}: ends only ${ev.cp}cp (White's view) — trap may not work`);
        }
      }
    }
    for (const m of o.mistakes) {
      const r = tryReplay(`${L} mistake "${m.title}"`, m.line);
      if (r && useEngine) {
        const ev = await evalWhite(r.fens[r.fens.length - 1], 16);
        console.log(`  ${o.id} mistake "${m.title}": ends ${ev.cp}cp (White's view)`);
      }
    }
    for (const q of o.quiz) {
      if (q.line) tryReplay(`${L} quiz "${q.q}"`, q.line);
      const correct = q.options.filter((x) => x.correct).length;
      if (correct !== 1) err(`${L} quiz "${q.q}": ${correct} correct options`);
    }
    if (o.modelGame) {
      const r = tryReplay(`${L} model game`, o.modelGame.line);
      if (r && o.modelGame.line.includes('#')) {
        const c = new Chess(r.fens[r.fens.length - 1]);
        if (!c.isCheckmate()) err(`${L} model game: ends with # but is not mate`);
      }
    }
  }
}

async function validateLessons() {
  const ids = new Set<string>();
  for (const mod of MODULES) {
    if (only && mod.id !== only) continue;
    for (const lesson of mod.lessons) {
      if (ids.has(lesson.id)) err(`duplicate lesson id ${lesson.id}`);
      ids.add(lesson.id);
      for (const [si, step] of lesson.steps.entries()) {
        const L = `${mod.id}/${lesson.id} step ${si + 1} (${step.kind})`;
        if (step.kind === 'practice') {
          const n = PUZZLES.filter((p) => p.themes.some((t) => step.themes.includes(t)) && p.rating <= (step.maxRating ?? 9999)).length;
          if (PUZZLES.length && n < step.count) warn(`${L}: only ${n} puzzles match ${step.themes.join(',')}`);
          continue;
        }
        let fen: string;
        try {
          fen = toFen(step.fen);
          new Chess(fen);
          const parts = fen.split(' ');
          parts[1] = parts[1] === 'w' ? 'b' : 'w';
          parts[3] = '-';
          if (new Chess(parts.join(' ')).inCheck()) err(`${L}: the side not to move is in check`);
        } catch (e) {
          err(`${L}: bad position: ${(e as Error).message}`);
          continue;
        }
        if (step.setup) {
          const r = tryReplay(`${L} setup`, step.setup, fen);
          if (!r) continue;
          fen = r.fens[r.fens.length - 1];
        }
        if (step.kind === 'demo') tryReplay(`${L} demo`, step.line, fen);
        if (step.kind === 'quiz') {
          const correct = step.options.filter((x) => x.correct).length;
          if (correct !== 1) err(`${L}: ${correct} correct options`);
        }
        if (step.kind === 'square') {
          for (const sq of step.squares) if (!/^[a-h][1-8]$/.test(sq)) err(`${L}: bad square ${sq}`);
        }
        if (step.kind === 'move') {
          const moves = parseLine(step.solution);
          const chess = new Chess(fen);
          for (const [mi, m] of moves.entries()) {
            const alts = m.san.split('|');
            const pos = chess.fen();
            for (const alt of alts) {
              try {
                new Chess(pos).move(alt);
              } catch {
                err(`${L}: illegal solution move "${alt}" at ${pos}`);
              }
            }
            if (useEngine && mi % 2 === 0) {
              const e = await getEngine();
              const res = await e.analyze(pos, { depth: 16, multipv: 2 });
              const best = res.lines[0];
              const second = res.lines[1];
              const bestSan = (() => {
                try {
                  return new Chess(pos).move({ from: best.move.slice(0, 2), to: best.move.slice(2, 4), promotion: best.move[4] }).san;
                } catch {
                  return best.move;
                }
              })();
              const ok = alts.map((a) => a.replace(/[+#]/g, '')).includes(bestSan.replace(/[+#]/g, '')) || (alts[0].endsWith('#') && bestSan.endsWith('#'));
              const c1 = scoreToCp(best?.score);
              const c2 = second ? scoreToCp(second.score) : -99999;
              if (!ok) {
                // Accept the authored move if it is nearly as good as the engine's choice.
                const authored = new Chess(pos);
                authored.move(alts[0]);
                const r2 = await e.analyze(authored.fen(), { depth: 15, multipv: 1 });
                const cAuth = -scoreToCp(r2.lines[0]?.score);
                const mateKept = (best.score.mate ?? 0) > 0 && (r2.lines[0]?.score?.mate ?? 0) < 0;
                if (!mateKept && c1 - cAuth > 60) warn(`${L}: solution ${alts[0]} (${cAuth}) is worse than engine ${bestSan} (${c1})`);
              } else if (moves.length === 1 && c1 - c2 < 80 && c1 < 5000 && STRICT.test(lesson.id)) {
                const secondSan = (() => {
                  try {
                    return new Chess(pos).move({ from: second.move.slice(0, 2), to: second.move.slice(2, 4), promotion: second.move[4] }).san;
                  } catch {
                    return second?.move;
                  }
                })();
                if (!alts.includes(secondSan)) warn(`${L}: ${alts[0]} is not clearly unique (2nd best ${secondSan} ${c2} vs ${c1}) — consider accepting it`);
              }
            }
            try {
              chess.move(alts[0]);
            } catch {
              break;
            }
          }
        }
      }
    }
  }
}

function validatePuzzles() {
  const ids = new Set<string>();
  for (const p of PUZZLES) {
    if (ids.has(p.id)) err(`duplicate puzzle id ${p.id}`);
    ids.add(p.id);
    try {
      const c = new Chess(p.fen);
      for (const u of p.moves) c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
    } catch (e) {
      err(`puzzle ${p.id}: ${(e as Error).message}`);
    }
  }
}

await validateOpenings();
await validateLessons();
if (!only) validatePuzzles();
engine?.quit();

for (const w of warnings) console.log('WARN ', w);
for (const e of errors) console.log('ERROR', e);
const lessonCount = MODULES.reduce((n, m) => n + m.lessons.length, 0);
console.log(`\n${OPENINGS.length} openings, ${MODULES.length} modules, ${lessonCount} lessons, ${PUZZLES.length} puzzles — ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
