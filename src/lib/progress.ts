import { MODULES } from '../content/curriculum';
import { OPENINGS } from '../content/openings';
import type { StageId } from '../content/types';
import { addDays, dayKey } from './dates';
import { checkAchievements } from './achievements';
import { progressStore, settingsStore, type Card, type GameRecord, type MistakeItem, type Progress } from './store';

/*
 * Every change to progress goes through here, so XP, streaks and trophies stay
 * consistent across lessons, drills, puzzles and games.
 */

export const XP = {
  lesson: 10,
  lessonPerfect: 5,
  checkpoint: 50,
  drillSession: 15,
  newPosition: 8,
  puzzle: 5,
  daily: 20,
  quiz: 10,
  openingLearned: 25,
};

/** Level n starts at 30·(n−1)² XP. */
export function levelInfo(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 30)) + 1;
  const start = 30 * (level - 1) ** 2;
  const next = 30 * level ** 2;
  return { level, start, next, progress: (xp - start) / (next - start) };
}

export function effectiveStreak(p: Progress, now = new Date()): number {
  const { lastDay, current } = p.streak;
  if (!lastDay) return 0;
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  if (lastDay === today || lastDay === yesterday) return current;
  // A missed day protected by a freeze still counts.
  const gap = p.streak.frozenDays.includes(yesterday) ? dayKey(addDays(now, -2)) : null;
  if (gap && lastDay === gap) return current;
  return 0;
}

export const todayXp = (p: Progress) => p.dailyXp[dayKey()] ?? 0;

export function awardXp(amount: number): { leveledUp: boolean; streakExtended: boolean } {
  const before = progressStore.get();
  const now = new Date();
  const today = dayKey(now);
  const yesterday = dayKey(addDays(now, -1));
  const s = before.streak;
  let current = s.current;
  let freezes = s.freezes;
  const frozenDays = [...s.frozenDays];
  let extended = false;
  if (s.lastDay !== today) {
    extended = true;
    if (s.lastDay === yesterday) current = s.current + 1;
    else if (s.lastDay === dayKey(addDays(now, -2)) && freezes > 0) {
      // One missed day: spend a freeze to keep the streak.
      freezes--;
      frozenDays.push(yesterday);
      current = s.current + 1;
    } else current = 1;
    // Earn a freeze every 7 days of streak (max 2 in reserve).
    if (current > 0 && current % 7 === 0) freezes = Math.min(2, freezes + 1);
  }
  const xp = before.xp + amount;
  progressStore.set({
    xp,
    dailyXp: { ...before.dailyXp, [today]: (before.dailyXp[today] ?? 0) + amount },
    streak: { current, best: Math.max(s.best, current), lastDay: today, freezes, frozenDays: frozenDays.slice(-30) },
  });
  checkAchievements();
  return { leveledUp: levelInfo(xp).level > levelInfo(before.xp).level, streakExtended: extended };
}

export function addSeconds(sec: number) {
  const p = progressStore.get();
  progressStore.set({ stats: { ...p.stats, seconds: p.stats.seconds + Math.round(sec) } });
}

// ---------------------------------------------------------------- Stages

export const STAGES: { id: StageId; name: string; range: string; modules: string[] }[] = [
  { id: 1, name: 'Foundations', range: 'Under 800', modules: ['m1', 'm2'] },
  { id: 2, name: 'Basics', range: '800–1200', modules: ['m3', 'm4'] },
  { id: 3, name: 'Club', range: '1200–1600', modules: ['m5', 'm6', 'm7'] },
  { id: 4, name: 'Advanced club', range: '1600–1900', modules: ['m8', 'm9'] },
  { id: 5, name: 'Strong', range: '1900+', modules: ['m10', 'm11'] },
];

export function checkpointPassed(p: Progress, moduleId: string): boolean {
  const mod = MODULES.find((m) => m.id === moduleId);
  const cp = mod?.lessons.find((l) => l.checkpoint);
  return !!cp && !!p.lessons[cp.id] && p.lessons[cp.id].bestAccuracy >= 0.8;
}

/** The stage you have reached: your starting stage, or further by passing checkpoints. */
export function currentStage(p: Progress): StageId {
  let stage = settingsStore.get().startStage as number;
  for (const s of STAGES) {
    if (s.id >= 5) break;
    if (s.modules.every((m) => checkpointPassed(p, m))) stage = Math.max(stage, s.id + 1);
    else break;
  }
  return stage as StageId;
}

export function moduleProgress(p: Progress, moduleId: string) {
  const mod = MODULES.find((m) => m.id === moduleId)!;
  const done = mod.lessons.filter((l) => p.lessons[l.id]).length;
  return { done, total: mod.lessons.length, pct: done / mod.lessons.length };
}

/** The next lesson to study, in curriculum order from your starting stage. */
export function nextLesson(p: Progress) {
  const start = settingsStore.get().startStage;
  for (const m of MODULES) {
    if (m.stage < start) continue;
    for (const l of m.lessons) if (!p.lessons[l.id]) return { module: m, lesson: l };
  }
  for (const m of MODULES) for (const l of m.lessons) if (!p.lessons[l.id]) return { module: m, lesson: l };
  return null;
}

export function completeLesson(lessonId: string, accuracy: number, checkpoint: boolean) {
  const p = progressStore.get();
  const prev = p.lessons[lessonId];
  const first = !prev;
  progressStore.set({
    lessons: {
      ...p.lessons,
      [lessonId]: { completedAt: Date.now(), bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy), attempts: (prev?.attempts ?? 0) + 1 },
    },
    lastLesson: lessonId,
    stats: { ...p.stats, lessonsDone: p.stats.lessonsDone + (first ? 1 : 0), perfectLessons: p.stats.perfectLessons + (accuracy === 1 ? 1 : 0) },
  });
  let xp = first ? XP.lesson : 4;
  if (accuracy === 1) xp += XP.lessonPerfect;
  if (checkpoint && accuracy >= 0.8 && (!prev || prev.bestAccuracy < 0.8)) xp += XP.checkpoint;
  return { xp, ...awardXp(xp) };
}

// ---------------------------------------------------------------- Opening drills (spaced repetition)

const BOX_MINUTES = [0, 10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7, 60 * 24 * 16, 60 * 24 * 35];
export const MASTERED_BOX = 3;

export function reviewCard(id: string, correct: boolean): { newlyMastered: boolean; firstTime: boolean } {
  const p = progressStore.get();
  const prev: Card | undefined = p.cards[id];
  const box = correct ? Math.min((prev?.box ?? 0) + 1, BOX_MINUTES.length - 1) : Math.max(0, (prev?.box ?? 0) - 2);
  const card: Card = {
    box,
    due: Date.now() + BOX_MINUTES[box] * 60_000,
    reps: (prev?.reps ?? 0) + 1,
    lapses: (prev?.lapses ?? 0) + (correct ? 0 : 1),
  };
  progressStore.set({ cards: { ...p.cards, [id]: card } });
  return { newlyMastered: correct && box === MASTERED_BOX && (prev?.box ?? 0) < MASTERED_BOX, firstTime: !prev };
}

export function openingMastery(p: Progress, openingId: string, cardIds: string[]) {
  const mastered = cardIds.filter((id) => (p.cards[id]?.box ?? 0) >= MASTERED_BOX).length;
  const seen = cardIds.filter((id) => p.cards[id]).length;
  const due = cardIds.filter((id) => p.cards[id] && p.cards[id].due <= Date.now()).length;
  void openingId;
  return { mastered, seen, due, total: cardIds.length, pct: cardIds.length ? mastered / cardIds.length : 0 };
}

export function markOpeningStudied(openingId: string, plies: number, totalPlies: number) {
  const p = progressStore.get();
  const prev = p.openings[openingId] ?? { studied: 0 };
  const studied = Math.max(prev.studied, plies);
  const justLearned = !prev.learnedAt && studied >= totalPlies;
  progressStore.set({ openings: { ...p.openings, [openingId]: { ...prev, studied, learnedAt: prev.learnedAt ?? (justLearned ? Date.now() : undefined) } } });
  if (justLearned) awardXp(XP.openingLearned);
  return justLearned;
}

export function recordOpeningQuiz(openingId: string, score: number) {
  const p = progressStore.get();
  const prev = p.openings[openingId] ?? { studied: 0 };
  progressStore.set({ openings: { ...p.openings, [openingId]: { ...prev, quizBest: Math.max(prev.quizBest ?? 0, score) } } });
}

export function finishDrillSession(correct: number, total: number, newMastered: number) {
  const p = progressStore.get();
  progressStore.set({ stats: { ...p.stats, drills: p.stats.drills + 1 } });
  const xp = XP.drillSession + newMastered * XP.newPosition + (total > 0 && correct === total ? 5 : 0);
  return { xp, ...awardXp(xp) };
}

export const openingCount = () => ({ white: OPENINGS.filter((o) => o.side === 'w').length, black: OPENINGS.filter((o) => o.side === 'b').length });

// ---------------------------------------------------------------- Puzzles

export function recordPuzzle(id: string, puzzleRating: number, ok: boolean, themes: string[], opts: { rated?: boolean; daily?: boolean } = {}) {
  const p = progressStore.get();
  const pz = p.puzzle;
  let rating = pz.rating;
  if (opts.rated !== false) {
    const k = pz.attempted < 30 ? 36 : 20;
    const expected = 1 / (1 + 10 ** ((puzzleRating - rating) / 400));
    rating = Math.round(Math.max(100, rating + k * ((ok ? 1 : 0) - expected)));
  }
  const themeStats = { ...pz.themes };
  for (const t of themes) {
    const s = themeStats[t] ?? { ok: 0, total: 0 };
    themeStats[t] = { ok: s.ok + (ok ? 1 : 0), total: s.total + 1 };
  }
  const streak = ok ? pz.streak + 1 : 0;
  progressStore.set({
    puzzle: {
      ...pz,
      rating,
      solved: pz.solved + (ok ? 1 : 0),
      attempted: pz.attempted + 1,
      streak,
      bestStreak: Math.max(pz.bestStreak, streak),
      history: { ...pz.history, [id]: { ok, at: Date.now() } },
      themes: themeStats,
      dailyDone: opts.daily && ok ? dayKey() : pz.dailyDone,
      ratingHistory: opts.rated !== false ? [...pz.ratingHistory, rating].slice(-60) : pz.ratingHistory,
    },
  });
  const xp = ok ? XP.puzzle + Math.min(5, Math.floor(streak / 3)) + (opts.daily ? XP.daily : 0) : 0;
  if (xp) awardXp(xp);
  else checkAchievements();
  return { rating, delta: rating - pz.rating, xp };
}

export function recordStorm(score: number) {
  const p = progressStore.get();
  progressStore.set({ puzzle: { ...p.puzzle, stormBest: Math.max(p.puzzle.stormBest, score) } });
  awardXp(Math.min(60, 5 + score * 2));
}

// ---------------------------------------------------------------- Games

export function recordGame(game: GameRecord, botElo: number, cleanWin: boolean) {
  const p = progressStore.get();
  const b = p.bots[game.bot] ?? { w: 0, l: 0, d: 0 };
  const bots = {
    ...p.bots,
    [game.bot]: {
      w: b.w + (game.result === 'win' ? 1 : 0),
      l: b.l + (game.result === 'loss' ? 1 : 0),
      d: b.d + (game.result === 'draw' ? 1 : 0),
      cleanWin: b.cleanWin || (game.result === 'win' && cleanWin),
    },
  };
  const openings = { ...p.openings };
  if (game.opening) {
    const o = openings[game.opening] ?? { studied: 0 };
    openings[game.opening] = { ...o, gamesPlayed: (o.gamesPlayed ?? 0) + 1 };
  }
  progressStore.set({
    games: [game, ...p.games].slice(0, 60),
    bots,
    openings,
    stats: { ...p.stats, movesPlayed: p.stats.movesPlayed + Math.ceil(game.sans.length / 2) },
  });
  const xp = game.result === 'win' ? Math.round(25 + Math.max(0, botElo - 400) / 60) : game.result === 'draw' ? 15 : 6;
  return { xp, ...awardXp(xp) };
}

export function updateGame(id: string, patch: Partial<GameRecord>) {
  const p = progressStore.get();
  progressStore.set({ games: p.games.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
}

export function addMistakes(items: Omit<MistakeItem, 'box' | 'due'>[]) {
  const p = progressStore.get();
  const mistakes = { ...p.mistakes };
  for (const m of items) if (!mistakes[m.id]) mistakes[m.id] = { ...m, box: 0, due: Date.now() };
  // Keep the queue a manageable size.
  const all = Object.values(mistakes).sort((a, b) => b.due - a.due);
  progressStore.set({ mistakes: Object.fromEntries(all.slice(0, 120).map((m) => [m.id, m])) });
}

export function reviewMistake(id: string, ok: boolean) {
  const p = progressStore.get();
  const m = p.mistakes[id];
  if (!m) return;
  const mistakes = { ...p.mistakes };
  const box = ok ? m.box + 1 : 0;
  if (ok && box >= 3) delete mistakes[id];
  else mistakes[id] = { ...m, box, due: Date.now() + [10, 60 * 24, 60 * 24 * 4][Math.min(box, 2)] * 60_000 };
  progressStore.set({ mistakes });
  if (ok) awardXp(XP.puzzle);
}

export const dueMistakes = (p: Progress) => Object.values(p.mistakes).filter((m) => m.due <= Date.now());
