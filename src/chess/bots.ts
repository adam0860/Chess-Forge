import { Chess, type Move } from 'chess.js';
import type { StageId } from '../content/types';
import { engine, scoreCp, type EngineLine } from './engine';
import { fromUci } from '../lib/line';

export type BotStyle = 'random' | 'simple' | 'aggressive' | 'positional' | 'defensive' | 'sharp' | 'max';

export interface Bot {
  id: string;
  name: string;
  elo: number;
  title: string;
  bio: string;
  style: BotStyle;
  stage: StageId;
  color: string;
  glyph: string; // piece code for the avatar
  greet: string;
  onWin: string; // the bot wins
  onLose: string; // the bot loses
  params: { depth: number; multipv: number; random: number; blunder: number; spread: number; skill: number; think: [number, number] };
}

/*
 * Strength comes from three dials: search depth, a "spread" (how far below the
 * best move the bot may choose), and occasional deliberate errors. Labels are
 * approximate and meant for calibration in playtesting.
 */
export const BOTS: Bot[] = [
  {
    id: 'pip',
    name: 'Pip',
    elo: 400,
    title: 'The Curious Pawn',
    bio: 'Pip just learned how the pieces move and loves to wander. Perfect for practising checks, captures and your first checkmates.',
    style: 'random',
    stage: 1,
    color: '#7fc8a9',
    glyph: 'wp',
    greet: 'Ooh, a game! Which one is the horsey again?',
    onWin: 'I won?! Wait till I tell the other pawns!',
    onLose: 'You got me! Again, again!',
    params: { depth: 2, multipv: 5, random: 0.38, blunder: 0.3, spread: 400, skill: 0, think: [500, 1100] },
  },
  {
    id: 'bramble',
    name: 'Bramble',
    elo: 800,
    title: 'The Hedge Knight',
    bio: 'Bramble develops sensibly and castles, but often misses two-move tactics. Punish loose pieces.',
    style: 'simple',
    stage: 2,
    color: '#a3c46c',
    glyph: 'wn',
    greet: 'Good day! May the better knight win.',
    onWin: 'Well fought! My hedge holds firm today.',
    onLose: 'A fine victory. I shall train harder.',
    params: { depth: 5, multipv: 4, random: 0.06, blunder: 0.16, spread: 140, skill: 3, think: [600, 1300] },
  },
  {
    id: 'vesna',
    name: 'Vesna',
    elo: 1100,
    title: 'The Spring Storm',
    bio: 'Vesna attacks at every chance and loves sacrifices. Calm defence and accurate counting will beat her.',
    style: 'aggressive',
    stage: 2,
    color: '#f08a5d',
    glyph: 'wq',
    greet: 'I hope your king is ready for a storm!',
    onWin: 'Ha! Fortune favours the bold!',
    onLose: 'Hmm. You defended well. Next time I bring more pieces.',
    params: { depth: 7, multipv: 4, random: 0.02, blunder: 0.1, spread: 90, skill: 6, think: [600, 1400] },
  },
  {
    id: 'iron-bishop',
    name: 'Iron Bishop',
    elo: 1400,
    title: 'The Patient Strategist',
    bio: 'Solid and positional. He grabs weak squares and slowly squeezes. Watch your pawn structure.',
    style: 'positional',
    stage: 3,
    color: '#8ea9c8',
    glyph: 'wb',
    greet: 'Let us see whose position holds together.',
    onWin: 'Weak squares are forever.',
    onLose: 'Impressive. You understood the position.',
    params: { depth: 9, multipv: 3, random: 0, blunder: 0.06, spread: 50, skill: 10, think: [700, 1600] },
  },
  {
    id: 'stonewall',
    name: 'Stonewall',
    elo: 1700,
    title: 'The Fortress',
    bio: 'Stonewall defends stubbornly and is very strong in endgames. You will need a real plan to break through.',
    style: 'defensive',
    stage: 4,
    color: '#b6a58a',
    glyph: 'wr',
    greet: 'Many have tried to break these walls.',
    onWin: 'The wall stands.',
    onLose: 'The wall… has fallen. Well played.',
    params: { depth: 12, multipv: 3, random: 0, blunder: 0.03, spread: 30, skill: 14, think: [800, 1800] },
  },
  {
    id: 'tempest',
    name: 'Tempest',
    elo: 2000,
    title: 'The Calculating Storm',
    bio: 'A sharp tactician who calculates deeply and punishes mistakes fast. Precision is mandatory.',
    style: 'sharp',
    stage: 5,
    color: '#9b7bd8',
    glyph: 'bq',
    greet: 'I have already calculated how this ends.',
    onWin: 'As calculated.',
    onLose: 'Remarkable. I did not see that coming.',
    params: { depth: 14, multipv: 2, random: 0, blunder: 0.012, spread: 18, skill: 18, think: [900, 2000] },
  },
  {
    id: 'oracle',
    name: 'The Oracle',
    elo: 2600,
    title: 'Full-strength Engine',
    bio: 'Stockfish at full strength. Use it to test your preparation and to feel what perfect defence is like.',
    style: 'max',
    stage: 5,
    color: '#e7b84b',
    glyph: 'bk',
    greet: 'I see many futures. In most of them, I win.',
    onWin: 'It was foreseen.',
    onLose: 'Impossible… Truly, you are a master.',
    params: { depth: 18, multipv: 1, random: 0, blunder: 0, spread: 0, skill: 20, think: [600, 1200] },
  },
];

export const getBot = (id: string) => BOTS.find((b) => b.id === id);

const CENTER = new Set(['c3', 'c4', 'c5', 'c6', 'd3', 'd4', 'd5', 'd6', 'e3', 'e4', 'e5', 'e6', 'f3', 'f4', 'f5', 'f6']);

function styleBonus(style: BotStyle, m: Move, ply: number): number {
  let b = 0;
  const forward = m.color === 'w' ? Number(m.to[1]) - Number(m.from[1]) : Number(m.from[1]) - Number(m.to[1]);
  if (style === 'aggressive' || style === 'sharp') {
    if (m.san.includes('+')) b += style === 'sharp' ? 18 : 30;
    if (m.captured) b += 15;
    if (forward > 0 && m.piece !== 'k') b += 6;
  }
  if (style === 'positional') {
    if ((m.piece === 'n' || m.piece === 'b') && CENTER.has(m.to)) b += 12;
    if (m.san.startsWith('O-O')) b += 25;
    if (m.captured === 'p' && ply < 30) b -= 8;
  }
  if (style === 'defensive') {
    if (m.san.startsWith('O-O')) b += 30;
    if (forward < 0) b += 8;
    if (m.piece === 'p' && ['f', 'g', 'h'].includes(m.from[0])) b -= 12;
    if (m.captured) b += 6; // trades simplify
  }
  if (style === 'simple' && m.san.startsWith('O-O')) b += 20;
  return b;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Chooses the bot's move for a position. Returns a UCI string. */
export async function botMove(bot: Bot, fen: string, ply: number): Promise<string> {
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true });
  if (!legal.length) return '';
  const p = bot.params;
  const t0 = Date.now();
  const delay = async () => {
    const wait = p.think[0] + Math.random() * (p.think[1] - p.think[0]) - (Date.now() - t0);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  };

  if (Math.random() < p.random) {
    // Even random moves prefer captures a little, so the bot does not look broken.
    const caps = legal.filter((m) => m.captured);
    const m = caps.length && Math.random() < 0.4 ? pick(caps) : pick(legal);
    await delay();
    return m.from + m.to + (m.promotion ?? '');
  }

  // Variety in the opening: consider more candidate moves early on.
  const multipv = Math.min(legal.length, ply < 8 && bot.style !== 'max' ? Math.max(3, p.multipv) : p.multipv);
  const res = await engine.analyze(fen, { depth: p.depth, multipv, skill: p.skill });
  const lines: EngineLine[] = res.lines.filter((l) => l.move);
  if (!lines.length) {
    await delay();
    const m = pick(legal);
    return m.from + m.to + (m.promotion ?? '');
  }
  const best = scoreCp(lines[0].score);
  let choice = lines[0];
  if (bot.style !== 'max') {
    if (Math.random() < p.blunder && lines.length > 1) {
      // A human-like mistake: a plausible move that drops some evaluation.
      const errs = lines.slice(1).filter((l) => best - scoreCp(l.score) >= 60);
      choice = errs.length ? pick(errs) : lines[lines.length - 1];
    } else {
      const window = ply < 8 ? Math.max(p.spread, 35) : p.spread;
      const cands = lines.filter((l) => best - scoreCp(l.score) <= window && !(lines[0].score.mate && lines[0].score.mate > 0 && !l.score.mate));
      const scored = cands.map((l) => {
        const mv = legal.find((m) => m.from + m.to + (m.promotion ?? '') === l.move);
        const bonus = mv ? styleBonus(bot.style, mv, ply) : 0;
        return { l, w: Math.exp((scoreCp(l.score) - best + bonus) / Math.max(15, window / 2)) };
      });
      const total = scored.reduce((a, b) => a + b.w, 0);
      let r = Math.random() * total;
      for (const s of scored) {
        r -= s.w;
        if (r <= 0) {
          choice = s.l;
          break;
        }
      }
    }
  }
  await delay();
  const mv = fromUci(choice.move);
  return mv.from + mv.to + (mv.promotion ?? '');
}
