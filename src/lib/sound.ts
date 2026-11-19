import { settingsStore } from './store';

/*
 * All sound effects are synthesized with the Web Audio API — no audio files to
 * ship, works offline, and every sound is tiny and consistent across platforms.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): { ctx: AudioContext; out: GainNode } | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      // A gentle compressor keeps layered notes from clipping.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    master!.gain.value = settingsStore.get().volume * 0.5;
    return { ctx, out: master! };
  } catch {
    return null;
  }
}

interface Note {
  freq: number;
  start: number; // seconds from now
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
}

function play(notes: Note[]) {
  if (!settingsStore.get().sound) return;
  const a = audio();
  if (!a) return;
  const t0 = a.ctx.currentTime + 0.01;
  for (const n of notes) {
    const osc = a.ctx.createOscillator();
    const g = a.ctx.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, t0 + n.start);
    if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo, t0 + n.start + n.dur);
    const peak = n.gain ?? 0.3;
    g.gain.setValueAtTime(0.0001, t0 + n.start);
    g.gain.exponentialRampToValueAtTime(peak, t0 + n.start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.start + n.dur);
    osc.connect(g).connect(a.out);
    osc.start(t0 + n.start);
    osc.stop(t0 + n.start + n.dur + 0.05);
  }
}

/** A short filtered noise burst plus a low body tone: the sound of wood on wood. */
function knock(opts: { at?: number; freq: number; body: number; gain: number; decay: number; q?: number }) {
  if (!settingsStore.get().sound) return;
  const a = audio();
  if (!a) return;
  const t0 = a.ctx.currentTime + 0.005 + (opts.at ?? 0);
  const len = Math.floor(a.ctx.sampleRate * 0.09);
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const bp = a.ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = opts.freq;
  bp.Q.value = opts.q ?? 2.2;
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(opts.gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.decay);
  src.connect(bp).connect(g).connect(a.out);
  src.start(t0);
  src.stop(t0 + 0.12);
  const osc = a.ctx.createOscillator();
  const og = a.ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(opts.body, t0);
  osc.frequency.exponentialRampToValueAtTime(opts.body * 0.6, t0 + opts.decay);
  og.gain.setValueAtTime(opts.gain * 0.55, t0);
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.decay * 1.2);
  osc.connect(og).connect(a.out);
  osc.start(t0);
  osc.stop(t0 + opts.decay * 1.3 + 0.02);
}

const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568 };

export const sfx = {
  tap: () => play([{ freq: 1200, start: 0, dur: 0.035, type: 'triangle', gain: 0.08 }]),
  select: () => play([{ freq: 740, start: 0, dur: 0.06, type: 'triangle', gain: 0.14 }]),
  correct: () =>
    play([
      { freq: N.E5, start: 0, dur: 0.16, type: 'sine', gain: 0.32 },
      { freq: N.E5 * 2, start: 0, dur: 0.12, type: 'triangle', gain: 0.05 },
      { freq: N.A5, start: 0.09, dur: 0.3, type: 'sine', gain: 0.34 },
      { freq: N.A5 * 2, start: 0.09, dur: 0.2, type: 'triangle', gain: 0.05 },
    ]),
  wrong: () =>
    play([
      { freq: 311, start: 0, dur: 0.16, type: 'triangle', gain: 0.32, slideTo: 290 },
      { freq: 233, start: 0.12, dur: 0.3, type: 'triangle', gain: 0.32, slideTo: 196 },
    ]),
  complete: () =>
    play([
      { freq: N.C5, start: 0, dur: 0.18, gain: 0.25 },
      { freq: N.E5, start: 0.1, dur: 0.18, gain: 0.25 },
      { freq: N.G5, start: 0.2, dur: 0.18, gain: 0.25 },
      { freq: N.C6, start: 0.3, dur: 0.6, gain: 0.3 },
      { freq: N.E6, start: 0.3, dur: 0.6, type: 'triangle', gain: 0.08 },
      { freq: N.G5, start: 0.3, dur: 0.6, gain: 0.12 },
    ]),
  achievement: () =>
    play([
      { freq: N.G5, start: 0, dur: 0.12, type: 'triangle', gain: 0.18 },
      { freq: N.B5, start: 0.07, dur: 0.12, type: 'triangle', gain: 0.18 },
      { freq: N.D5 * 2, start: 0.14, dur: 0.12, type: 'triangle', gain: 0.18 },
      { freq: N.G6, start: 0.21, dur: 0.5, type: 'sine', gain: 0.22 },
    ]),
  move: () => knock({ freq: 1600, body: 190, gain: 0.55, decay: 0.07 }),
  capture: () => {
    knock({ freq: 2300, body: 240, gain: 0.6, decay: 0.06, q: 1.4 });
    knock({ at: 0.035, freq: 1300, body: 160, gain: 0.45, decay: 0.08 });
  },
  castle: () => {
    knock({ freq: 1500, body: 180, gain: 0.5, decay: 0.07 });
    knock({ at: 0.11, freq: 1700, body: 200, gain: 0.5, decay: 0.07 });
  },
  check: () => {
    knock({ freq: 1800, body: 210, gain: 0.55, decay: 0.07 });
    play([{ freq: N.E6, start: 0.02, dur: 0.18, type: 'sine', gain: 0.12 }, { freq: N.B5, start: 0.02, dur: 0.22, type: 'triangle', gain: 0.05 }]);
  },
  illegal: () => play([{ freq: 220, start: 0, dur: 0.09, type: 'triangle', gain: 0.14, slideTo: 180 }]),
  gameEnd: () =>
    play([
      { freq: N.C5, start: 0, dur: 0.5, gain: 0.18 },
      { freq: N.G5, start: 0.08, dur: 0.6, gain: 0.16 },
      { freq: N.E6 / 2, start: 0.16, dur: 0.8, type: 'triangle', gain: 0.08 },
    ]),
  lose: () =>
    play([
      { freq: N.E5, start: 0, dur: 0.3, gain: 0.18 },
      { freq: N.C5, start: 0.18, dur: 0.5, gain: 0.18 },
      { freq: 392, start: 0.36, dur: 0.7, type: 'triangle', gain: 0.1 },
    ]),
  hint: () => play([{ freq: N.D5, start: 0, dur: 0.1, gain: 0.15 }, { freq: N.A5, start: 0.06, dur: 0.18, gain: 0.12 }]),
};
