import { MODULES } from '../content/curriculum';
import { OPENINGS } from '../content/openings';
import { progressStore, type Progress } from './store';
import { sfx } from './sound';
import { toast } from './ui';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string; // Icon name
  group: 'Learning' | 'Openings' | 'Puzzles' | 'Play' | 'Dedication';
  check: (p: Progress) => boolean;
}

const MASTERED = 3;
const learned = (p: Progress, side?: 'w' | 'b') =>
  OPENINGS.filter((o) => (!side || o.side === side) && p.openings[o.id]?.learnedAt).length;
const masteredCards = (p: Progress) => Object.values(p.cards).filter((c) => c.box >= MASTERED).length;
const checkpoints = (p: Progress) =>
  MODULES.filter((m) => {
    const cp = m.lessons.find((l) => l.checkpoint);
    return cp && (p.lessons[cp.id]?.bestAccuracy ?? 0) >= 0.8;
  }).length;
const wins = (p: Progress, bot?: string) => p.games.filter((g) => g.result === 'win' && (!bot || g.bot === bot)).length + (bot ? 0 : 0);
const botWin = (p: Progress, bot: string) => (p.bots[bot]?.w ?? 0) > 0;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'First Steps', desc: 'Complete your first lesson.', icon: 'learn', group: 'Learning', check: (p) => p.stats.lessonsDone >= 1 },
  { id: 'perfect', title: 'Flawless', desc: 'Finish a lesson with 100% accuracy.', icon: 'sparkles', group: 'Learning', check: (p) => p.stats.perfectLessons >= 1 },
  { id: 'lessons-25', title: 'Dedicated Student', desc: 'Complete 25 lessons.', icon: 'book-open', group: 'Learning', check: (p) => p.stats.lessonsDone >= 25 },
  { id: 'checkpoint-1', title: 'Checkpoint Cleared', desc: 'Pass your first module checkpoint.', icon: 'flag', group: 'Learning', check: (p) => checkpoints(p) >= 1 },
  { id: 'checkpoint-all', title: 'Forged', desc: 'Pass every module checkpoint.', icon: 'crown', group: 'Learning', check: (p) => checkpoints(p) >= MODULES.length },

  { id: 'opening-1', title: 'Opening Act', desc: 'Learn your first opening.', icon: 'book', group: 'Openings', check: (p) => learned(p) >= 1 },
  { id: 'white-all', title: 'White Repertoire', desc: 'Learn all 10 White openings.', icon: 'king-w', group: 'Openings', check: (p) => learned(p, 'w') >= OPENINGS.filter((o) => o.side === 'w').length },
  { id: 'black-all', title: 'Black Repertoire', desc: 'Learn all 10 Black openings.', icon: 'king-b', group: 'Openings', check: (p) => learned(p, 'b') >= OPENINGS.filter((o) => o.side === 'b').length },
  { id: 'cards-25', title: 'Muscle Memory', desc: 'Master 25 opening positions.', icon: 'target', group: 'Openings', check: (p) => masteredCards(p) >= 25 },
  { id: 'cards-150', title: 'Walking Encyclopedia', desc: 'Master 150 opening positions.', icon: 'library', group: 'Openings', check: (p) => masteredCards(p) >= 150 },

  { id: 'puzzle-1', title: 'Problem Solver', desc: 'Solve your first puzzle.', icon: 'puzzle', group: 'Puzzles', check: (p) => p.puzzle.solved >= 1 },
  { id: 'puzzle-100', title: 'Tactician', desc: 'Solve 100 puzzles.', icon: 'puzzle', group: 'Puzzles', check: (p) => p.puzzle.solved >= 100 },
  { id: 'puzzle-streak-10', title: 'On Fire', desc: 'Solve 10 puzzles in a row.', icon: 'flame', group: 'Puzzles', check: (p) => p.puzzle.bestStreak >= 10 },
  { id: 'rating-1200', title: 'Sharp Eye', desc: 'Reach a puzzle rating of 1200.', icon: 'gauge', group: 'Puzzles', check: (p) => p.puzzle.rating >= 1200 },
  { id: 'rating-1600', title: 'Eagle Eye', desc: 'Reach a puzzle rating of 1600.', icon: 'gauge', group: 'Puzzles', check: (p) => p.puzzle.rating >= 1600 },
  { id: 'rating-2000', title: 'Calculator', desc: 'Reach a puzzle rating of 2000.', icon: 'gauge', group: 'Puzzles', check: (p) => p.puzzle.rating >= 2000 },
  { id: 'storm-15', title: 'Storm Chaser', desc: 'Score 15 in Puzzle Storm.', icon: 'zap', group: 'Puzzles', check: (p) => p.puzzle.stormBest >= 15 },

  { id: 'first-win', title: 'First Victory', desc: 'Win a game against any opponent.', icon: 'trophy', group: 'Play', check: (p) => wins(p) >= 1 },
  { id: 'beat-vesna', title: 'Storm Weathered', desc: 'Beat Vesna.', icon: 'swords', group: 'Play', check: (p) => botWin(p, 'vesna') },
  { id: 'beat-iron', title: 'Iron Breaker', desc: 'Beat the Iron Bishop.', icon: 'swords', group: 'Play', check: (p) => botWin(p, 'iron-bishop') },
  { id: 'clean-stonewall', title: 'Wall Breaker', desc: 'Beat Stonewall without hints.', icon: 'shield', group: 'Play', check: (p) => !!p.bots['stonewall']?.cleanWin },
  { id: 'clean-tempest', title: 'Eye of the Storm', desc: 'Beat Tempest without hints.', icon: 'crown', group: 'Play', check: (p) => !!p.bots['tempest']?.cleanWin },
  { id: 'reviewed', title: 'Honest Mirror', desc: 'Review one of your games.', icon: 'history', group: 'Play', check: (p) => p.games.some((g) => g.review) },

  { id: 'streak-3', title: 'Warming Up', desc: 'Reach a 3-day streak.', icon: 'flame', group: 'Dedication', check: (p) => p.streak.best >= 3 },
  { id: 'streak-30', title: 'Iron Habit', desc: 'Reach a 30-day streak.', icon: 'flame', group: 'Dedication', check: (p) => p.streak.best >= 30 },
  { id: 'streak-100', title: 'Unbreakable', desc: 'Reach a 100-day streak.', icon: 'flame', group: 'Dedication', check: (p) => p.streak.best >= 100 },
  { id: 'xp-1000', title: 'Rising Star', desc: 'Earn 1,000 XP.', icon: 'star', group: 'Dedication', check: (p) => p.xp >= 1000 },
  { id: 'xp-10000', title: 'Grandmaster of Grind', desc: 'Earn 10,000 XP.', icon: 'star', group: 'Dedication', check: (p) => p.xp >= 10000 },
];

/** Grants any newly earned achievements, with a toast for each. */
export function checkAchievements() {
  const p = progressStore.get();
  const fresh = ACHIEVEMENTS.filter((a) => !p.achievements[a.id] && a.check(p));
  if (!fresh.length) return;
  const now = Date.now();
  progressStore.set({ achievements: { ...p.achievements, ...Object.fromEntries(fresh.map((a) => [a.id, now])) } });
  fresh.forEach((a, i) =>
    setTimeout(() => {
      sfx.achievement();
      toast({ icon: a.icon, title: `Trophy: ${a.title}`, body: a.desc, tone: 'achievement' }, 4200);
    }, 400 + i * 900),
  );
}
