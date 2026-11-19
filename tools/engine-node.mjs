// Promise-based UCI wrapper around the Stockfish WASM build for Node scripts
// (content validation and puzzle generation). Not shipped in the app.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function scoreToCp(s) {
  if (s == null) return 0;
  if (s.mate != null) return s.mate > 0 ? 100000 - s.mate * 100 : -100000 - s.mate * 100;
  return s.cp;
}

export class Engine {
  constructor(flavor = 'lite-single') {
    this.listeners = [];
    this.sf = require('stockfish')(flavor, (line) => {
      for (const l of [...this.listeners]) l(line);
    });
    this.sf.processCommand('uci');
    this.sf.processCommand('setoption name Hash value 32');
  }

  send(cmd) {
    this.sf.processCommand(cmd);
  }

  waitFor(pred) {
    return new Promise((resolve) => {
      const l = (line) => {
        if (pred(line)) {
          this.listeners = this.listeners.filter((x) => x !== l);
          resolve(line);
        }
      };
      this.listeners.push(l);
    });
  }

  async ready() {
    const p = this.waitFor((l) => l === 'readyok');
    this.send('isready');
    await p;
  }

  async newGame() {
    this.send('ucinewgame');
    await this.ready();
  }

  /**
   * Analyse a position. Returns the final multipv lines (scores from the side to
   * move) and, for multipv 1, the best move reported at each depth.
   */
  async analyze(fen, { depth = 12, multipv = 1, movetime } = {}) {
    await this.ready();
    this.send(`setoption name MultiPV value ${multipv}`);
    this.send(`position fen ${fen}`);
    const lines = new Map();
    const history = [];
    const onInfo = (line) => {
      if (!line.startsWith('info ') || !line.includes(' pv ')) return;
      const d = Number(line.match(/ depth (\d+)/)?.[1]);
      const mpv = Number(line.match(/ multipv (\d+)/)?.[1] ?? 1);
      const cp = line.match(/ score cp (-?\d+)/);
      const mate = line.match(/ score mate (-?\d+)/);
      if (line.includes(' lowerbound') || line.includes(' upperbound')) return;
      const pv = line.split(' pv ')[1].trim().split(/\s+/);
      const score = mate ? { mate: Number(mate[1]) } : { cp: Number(cp?.[1] ?? 0) };
      lines.set(mpv, { move: pv[0], pv, score, depth: d });
      if (mpv === 1) history.push({ depth: d, move: pv[0] });
    };
    this.listeners.push(onInfo);
    const done = this.waitFor((l) => l.startsWith('bestmove'));
    this.send(movetime ? `go movetime ${movetime}` : `go depth ${depth}`);
    const best = await done;
    this.listeners = this.listeners.filter((x) => x !== onInfo);
    const out = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
    const bestmove = best.split(/\s+/)[1];
    if (out.length === 0 && bestmove && bestmove !== '(none)') out.push({ move: bestmove, pv: [bestmove], score: { cp: 0 }, depth: 0 });
    return { lines: out, history, bestmove };
  }

  quit() {
    try {
      this.sf.terminate();
    } catch {
      /* already gone */
    }
  }
}
