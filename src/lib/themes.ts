import type { BoardTheme, PieceSet } from './store';

/*
 * Board and piece themes. Most ship unlocked; a few are earned through levels
 * or trophies. Unlocks are cosmetic only and never gate learning.
 */

export interface Unlock {
  level?: number;
  achievement?: string;
}

export interface BoardDef {
  id: BoardTheme;
  name: string;
  light: string;
  dark: string;
  /** Highlight tints for this board. */
  last: string;
  select: string;
  unlock?: Unlock;
}

export const BOARDS: BoardDef[] = [
  { id: 'walnut', name: 'Walnut', light: '#ecd6b0', dark: '#b17f55', last: 'rgba(240, 200, 70, 0.48)', select: 'rgba(255, 170, 60, 0.55)' },
  { id: 'slate', name: 'Slate', light: '#dee3e6', dark: '#8ca2ad', last: 'rgba(155, 199, 0, 0.42)', select: 'rgba(20, 85, 30, 0.45)' },
  { id: 'forest', name: 'Forest', light: '#eeeed2', dark: '#769656', last: 'rgba(246, 246, 105, 0.6)', select: 'rgba(186, 202, 68, 0.75)' },
  { id: 'marble', name: 'Marble', light: '#e9e6df', dark: '#9b958c', last: 'rgba(232, 131, 58, 0.42)', select: 'rgba(232, 131, 58, 0.58)' },
  { id: 'ice', name: 'Glacier', light: '#e4f0f7', dark: '#7aa6c2', last: 'rgba(120, 220, 255, 0.45)', select: 'rgba(40, 140, 220, 0.5)', unlock: { level: 5 } },
  { id: 'royal', name: 'Royal', light: '#e7dcf5', dark: '#8a6db8', last: 'rgba(255, 210, 90, 0.5)', select: 'rgba(255, 190, 60, 0.55)', unlock: { level: 10 } },
  { id: 'ember', name: 'Ember', light: '#f3d9c2', dark: '#c0623a', last: 'rgba(255, 220, 120, 0.5)', select: 'rgba(255, 160, 60, 0.6)', unlock: { achievement: 'streak-30' } },
  { id: 'midnight', name: 'Midnight', light: '#5c6577', dark: '#323a4a', last: 'rgba(232, 131, 58, 0.5)', select: 'rgba(255, 170, 70, 0.55)', unlock: { achievement: 'rating-1600' } },
];

export interface PieceDef {
  id: PieceSet;
  name: string;
  vars: { wFill: string; wLine: string; bFill: string; bLine: string };
  unlock?: Unlock;
}

export const PIECE_SETS: PieceDef[] = [
  { id: 'classic', name: 'Classic', vars: { wFill: '#ffffff', wLine: '#111111', bFill: '#141414', bLine: '#f2f2f2' } },
  { id: 'ivory', name: 'Ivory & Ebony', vars: { wFill: '#f6ead2', wLine: '#3b2a1a', bFill: '#33231a', bLine: '#ecd8b2' } },
  { id: 'slate', name: 'Slate', vars: { wFill: '#eef3fa', wLine: '#1d2939', bFill: '#26344d', bLine: '#a9bcda' } },
  { id: 'ember', name: 'Forge Ember', vars: { wFill: '#ffe4c7', wLine: '#5a2a0a', bFill: '#3a1206', bLine: '#ff9a4d' }, unlock: { level: 8 } },
  { id: 'gold', name: 'Gold & Onyx', vars: { wFill: '#ffd772', wLine: '#5b3d00', bFill: '#151515', bLine: '#e7b84b' }, unlock: { achievement: 'checkpoint-all' } },
];

export function isUnlocked(u: Unlock | undefined, level: number, achievements: Record<string, number>): boolean {
  if (!u) return true;
  if (u.level && level < u.level) return false;
  if (u.achievement && !achievements[u.achievement]) return false;
  return true;
}

export const unlockLabel = (u: Unlock) => (u.level ? `Reach level ${u.level}` : `Earn a trophy`);
