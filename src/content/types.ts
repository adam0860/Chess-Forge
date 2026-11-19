/*
 * Content model. Openings and lessons are authored as data (see src/content/**)
 * and checked by scripts/validate-content.ts: every move must be legal, every
 * position valid, and every "find the move" answer confirmed by Stockfish.
 *
 * Move lines are written in a compact PGN-like text: SAN moves, optional move
 * numbers, and a {comment} after any move, e.g.
 *   "1. e4 {Grabs the centre.} e5 2. Nf3 {Attacks e5.} Nc6"
 */

export type Color = 'w' | 'b';

/** A parsed move with its explanation. */
export interface LineMove {
  san: string;
  note?: string;
}

export type StageId = 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------- Openings

export interface OpeningVariation {
  id: string;
  name: string;
  /** Number of plies of the main line played before this variation branches off. */
  from: number;
  /** Moves after the branch point (the first move is the deviation). */
  line: string;
  summary: string;
}

export interface OpeningTrap {
  id: string;
  name: string;
  /** Who springs it: 'you' = a trap you can set, 'them' = one you must avoid. */
  side: 'you' | 'them';
  /** Full line from the starting position. */
  line: string;
  summary: string;
}

export interface OpeningMistake {
  title: string;
  /** Full line from the starting position, ending with the mistake and its punishment. */
  line: string;
  explanation: string;
}

export interface QuizQuestion {
  q: string;
  /** Optional line from the start: the board shows the position after it. */
  line?: string;
  options: { text: string; correct?: boolean; why: string }[];
}

export interface Opening {
  id: string;
  name: string;
  /** The side the learner plays in this opening. */
  side: Color;
  eco: string;
  stage: StageId;
  tagline: string;
  character: string; // e.g. "Open, tactical"
  overview: string[];
  whenToPlay: string;
  goals: { white: string[]; black: string[] };
  plans: string[];
  mainLine: { name: string; line: string };
  variations: OpeningVariation[];
  traps: OpeningTrap[];
  mistakes: OpeningMistake[];
  quiz: QuizQuestion[];
  modelGame?: { title: string; line: string; summary: string };
}

// ---------------------------------------------------------------- Lessons

export interface Arrow {
  from: string;
  to: string;
  color?: 'green' | 'red' | 'blue' | 'gold';
}

interface BoardSpec {
  /** A FEN, or a piece list (see lib/position.ts), or omitted for the start position. */
  fen?: string;
  /** Moves played from `fen` (or the start) before the step begins. */
  setup?: string;
  orientation?: Color;
  arrows?: Arrow[];
  highlights?: string[];
}

export interface TextStep extends BoardSpec {
  kind: 'text';
  title?: string;
  body: string;
  /** Show no board for pure-text steps. */
  noBoard?: boolean;
}

export interface DemoStep extends BoardSpec {
  kind: 'demo';
  title?: string;
  body: string;
  /** Moves to step through, with {comments}. */
  line: string;
}

export interface MoveStep extends BoardSpec {
  kind: 'move';
  prompt: string;
  /**
   * Solution line: the learner plays the 1st, 3rd, 5th… moves; the app replies
   * with the others. Alternatives for a learner move: "Qh5|Qg4".
   */
  solution: string;
  hint: string;
  explain: string;
}

export interface QuizStep extends BoardSpec {
  kind: 'quiz';
  prompt: string;
  options: { text: string; correct?: boolean; why: string }[];
  noBoard?: boolean;
}

export interface SquareStep extends BoardSpec {
  kind: 'square';
  prompt: string;
  /** Any of these squares is correct; the learner must find all when `all` is set. */
  squares: string[];
  all?: boolean;
  explain: string;
}

/** Practice drawn from the engine-verified puzzle set by theme. */
export interface PracticeStep {
  kind: 'practice';
  title: string;
  themes: string[];
  count: number;
  maxRating?: number;
  fen?: undefined;
  setup?: undefined;
}

export type LessonStep = TextStep | DemoStep | MoveStep | QuizStep | SquareStep | PracticeStep;

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  checkpoint?: boolean;
  steps: LessonStep[];
}

export interface Module {
  id: string;
  num: number;
  title: string;
  stage: StageId;
  blurb: string;
  icon: string; // a piece letter for the module badge: K Q R B N P
  lessons: Lesson[];
}

// ---------------------------------------------------------------- Puzzles

export interface Puzzle {
  id: string;
  /** Position before the opponent's move. */
  fen: string;
  /** UCI moves: [opponent's move, your move, reply, your move, …]. */
  moves: string[];
  rating: number;
  themes: string[];
}
