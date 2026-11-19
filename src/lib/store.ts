import { useSyncExternalStore } from 'react';
import { loadJSON, saveJSON } from './storage';
import type { StageId } from '../content/types';

// ---------------------------------------------------------------------------
// A tiny observable store that persists itself to localStorage.
// ---------------------------------------------------------------------------

class Store<T extends object> {
  private state: T;
  private listeners = new Set<() => void>();
  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private key: string,
    private defaults: T,
  ) {
    this.state = loadJSON(key, defaults);
  }

  get = () => this.state;

  set = (update: Partial<T> | ((s: T) => Partial<T>)) => {
    const patch = typeof update === 'function' ? update(this.state) : update;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => saveJSON(this.key, this.state), 150);
  };

  replace = (next: T) => {
    this.state = { ...this.defaults, ...next };
    this.listeners.forEach((l) => l());
    saveJSON(this.key, this.state);
  };

  reset = () => this.replace(this.defaults);

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  flush = () => {
    clearTimeout(this.saveTimer);
    saveJSON(this.key, this.state);
  };
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type ThemePref = 'system' | 'light' | 'dark' | 'midnight';
export type Accent = 'ember' | 'ocean' | 'emerald' | 'violet' | 'rose';
export type BoardTheme = 'walnut' | 'slate' | 'forest' | 'marble' | 'ember' | 'midnight' | 'ice' | 'royal';
export type PieceSet = 'classic' | 'ivory' | 'slate' | 'ember' | 'gold';

export interface Settings {
  name: string;
  theme: ThemePref;
  accent: Accent;
  board: BoardTheme;
  pieces: PieceSet;
  coordinates: boolean;
  legalDots: boolean;
  animation: 'fast' | 'normal' | 'slow';
  textScale: number;
  motion: 'system' | 'full' | 'reduced';
  sound: boolean;
  volume: number;
  haptics: boolean;
  celebrations: boolean;
  autoQueen: boolean;
  confirmResign: boolean;
  dailyGoal: number;
  coachHints: boolean;
  coachEval: boolean;
  coachFlags: boolean;
  onboarded: boolean;
  startStage: StageId;
}

export const defaultSettings: Settings = {
  name: '',
  theme: 'dark',
  accent: 'ember',
  board: 'walnut',
  pieces: 'classic',
  coordinates: true,
  legalDots: true,
  animation: 'normal',
  textScale: 1,
  motion: 'system',
  sound: true,
  volume: 0.65,
  haptics: true,
  celebrations: true,
  autoQueen: false,
  confirmResign: true,
  dailyGoal: 50,
  coachHints: true,
  coachEval: false,
  coachFlags: true,
  onboarded: false,
  startStage: 1,
};

export const settingsStore = new Store<Settings>('chessforge.settings.v1', defaultSettings);
export const useSettings = (): Settings => useSyncExternalStore(settingsStore.subscribe, settingsStore.get);
export const setSettings = settingsStore.set;

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export interface LessonProgress {
  completedAt: number;
  bestAccuracy: number;
  attempts: number;
}

/** A spaced-repetition card for one position in an opening line. */
export interface Card {
  box: number; // 0 new/relearning … 6
  due: number;
  reps: number;
  lapses: number;
}

export interface OpeningProgress {
  studied: number; // walkthrough steps completed (main line plies seen)
  learnedAt?: number;
  quizBest?: number;
  gamesPlayed?: number;
}

export interface GameRecord {
  id: string;
  date: number;
  bot: string;
  color: 'w' | 'b';
  result: 'win' | 'loss' | 'draw';
  reason: string;
  sans: string[];
  startFen?: string;
  opening?: string;
  hints: number;
  accuracy?: number;
  review?: ReviewSummary;
}

export interface ReviewMove {
  ply: number;
  san: string;
  best: string; // SAN of the engine's best move
  cpBefore: number; // White's view
  cpAfter: number;
  cls: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
  pv?: string[];
}

export interface ReviewSummary {
  moves: ReviewMove[];
  accuracy: { w: number; b: number };
  counts: Record<string, number>;
}

/** A position from your own games where you went wrong, replayed as a puzzle. */
export interface MistakeItem {
  id: string;
  fen: string;
  best: string; // UCI
  played: string; // SAN
  gameId: string;
  box: number;
  due: number;
}

export interface Progress {
  xp: number;
  dailyXp: Record<string, number>;
  streak: { current: number; best: number; lastDay: string | null; freezes: number; frozenDays: string[] };
  lessons: Record<string, LessonProgress>;
  openings: Record<string, OpeningProgress>;
  cards: Record<string, Card>;
  puzzle: {
    rating: number;
    solved: number;
    attempted: number;
    streak: number;
    bestStreak: number;
    stormBest: number;
    history: Record<string, { ok: boolean; at: number }>;
    themes: Record<string, { ok: number; total: number }>;
    dailyDone: string | null;
    ratingHistory: number[];
  };
  games: GameRecord[];
  bots: Record<string, { w: number; l: number; d: number; cleanWin?: boolean }>;
  mistakes: Record<string, MistakeItem>;
  achievements: Record<string, number>;
  stats: { seconds: number; drills: number; lessonsDone: number; perfectLessons: number; movesPlayed: number };
  lastLesson: string | null;
  createdAt: number;
}

export const defaultProgress: Progress = {
  xp: 0,
  dailyXp: {},
  streak: { current: 0, best: 0, lastDay: null, freezes: 0, frozenDays: [] },
  lessons: {},
  openings: {},
  cards: {},
  puzzle: {
    rating: 800,
    solved: 0,
    attempted: 0,
    streak: 0,
    bestStreak: 0,
    stormBest: 0,
    history: {},
    themes: {},
    dailyDone: null,
    ratingHistory: [],
  },
  games: [],
  bots: {},
  mistakes: {},
  achievements: {},
  stats: { seconds: 0, drills: 0, lessonsDone: 0, perfectLessons: 0, movesPlayed: 0 },
  lastLesson: null,
  createdAt: Date.now(),
};

export const progressStore = new Store<Progress>('chessforge.progress.v1', defaultProgress);
export const useProgress = (): Progress => useSyncExternalStore(progressStore.subscribe, progressStore.get);

export function exportData(): string {
  return JSON.stringify({ app: 'chess-forge', version: 1, progress: progressStore.get(), settings: settingsStore.get() }, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data?.app !== 'chess-forge' || !data.progress) return false;
    progressStore.replace({ ...defaultProgress, ...data.progress });
    if (data.settings) settingsStore.replace({ ...defaultSettings, ...data.settings });
    return true;
  } catch {
    return false;
  }
}

window.addEventListener('pagehide', () => {
  progressStore.flush();
  settingsStore.flush();
});
