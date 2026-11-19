import type { Opening } from '../types';
import { italian, ruyLopez, scotch, vienna, kingsGambit } from './white-e4';
import { queensGambit, london, catalan, english, reti } from './white-d4';
import { najdorf, french, caroKann, petrov, pirc, scandinavian } from './black-e4';
import { kingsIndian, qgd, nimzo, slav } from './black-d4';

export const OPENINGS: Opening[] = [
  italian, ruyLopez, scotch, vienna, kingsGambit, queensGambit, london, catalan, english, reti,
  najdorf, french, caroKann, petrov, pirc, scandinavian, kingsIndian, qgd, nimzo, slav,
];

export const getOpening = (id: string) => OPENINGS.find((o) => o.id === id);
