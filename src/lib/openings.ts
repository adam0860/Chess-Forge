import { OPENINGS } from '../content/openings';
import type { Opening } from '../content/types';
import { parseLine, replay, START_FEN, type Replayed } from './line';

/*
 * Derived opening data: every line as a full move list from the start, and the
 * drill cards (positions where the learner must find the move).
 */

export interface OpeningLine {
  id: string; // 'main' or variation id
  name: string;
  summary?: string;
  sans: string[];
  notes: (string | undefined)[];
  from: number; // where it leaves the main line (0 for main)
  replay: Replayed;
}

export interface DrillCard {
  id: string;
  openingId: string;
  lineId: string;
  ply: number; // index of the learner's move in the line
}

export interface BuiltOpening {
  opening: Opening;
  main: OpeningLine;
  variations: OpeningLine[];
  lines: OpeningLine[];
  cards: DrillCard[];
}

const cache = new Map<string, BuiltOpening>();

export function buildOpening(o: Opening): BuiltOpening {
  const hit = cache.get(o.id);
  if (hit) return hit;
  const mainMoves = parseLine(o.mainLine.line);
  const mainRep = replay(mainMoves);
  const main: OpeningLine = { id: 'main', name: o.mainLine.name, sans: mainMoves.map((m) => m.san), notes: mainMoves.map((m) => m.note), from: 0, replay: mainRep };
  const variations = o.variations.map((v) => {
    const vm = parseLine(v.line);
    const sans = [...main.sans.slice(0, v.from), ...vm.map((m) => m.san)];
    const notes = [...main.notes.slice(0, v.from), ...vm.map((m) => m.note)];
    return { id: v.id, name: v.name, summary: v.summary, sans, notes, from: v.from, replay: replay(sans.map((san) => ({ san }))) };
  });
  const lines = [main, ...variations];
  const learnerParity = o.side === 'w' ? 0 : 1;
  const cards: DrillCard[] = [];
  const seenPos = new Set<string>();
  for (const line of lines) {
    line.sans.forEach((_, ply) => {
      if (ply % 2 !== learnerParity) return;
      // Shared positions (before a variation branches) get one card, owned by the main line.
      const posKey = line.replay.fens[ply].split(' ').slice(0, 4).join(' ');
      if (seenPos.has(posKey)) return;
      seenPos.add(posKey);
      cards.push({ id: `${o.id}:${line.id}:${ply}`, openingId: o.id, lineId: line.id, ply });
    });
  }
  const built = { opening: o, main, variations, lines, cards };
  cache.set(o.id, built);
  return built;
}

export const allBuilt = () => OPENINGS.map(buildOpening);

/** Full move list of a trap / mistake / model game. */
export function fullLine(text: string) {
  const moves = parseLine(text);
  return { moves, replay: replay(moves, START_FEN) };
}

/** Move-number label for a ply index. */
export const plyLabel = (ply: number) => `${Math.floor(ply / 2) + 1}${ply % 2 ? '…' : '.'}`;
