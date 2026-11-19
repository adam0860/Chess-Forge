import type { Module } from '../types';
import { m1, m2 } from './m1-m2';
import { m3, m4 } from './m3-m4';
import { m5, m6, m7, m8 } from './m5-m8';
import { m9, m10, m11 } from './m9-m11';

export const MODULES: Module[] = [m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11];

export const getModule = (id: string) => MODULES.find((m) => m.id === id);
export const allLessons = () => MODULES.flatMap((m) => m.lessons.map((l) => ({ module: m, lesson: l })));
export const getLesson = (id: string) => allLessons().find((x) => x.lesson.id === id);
