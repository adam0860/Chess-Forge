/*
 * Stockfish (WASM, lite single-threaded build) running in a Web Worker.
 * Jobs run one at a time; a new urgent job can stop the current one.
 */

export interface EngineScore {
  cp?: number;
  mate?: number;
}
export interface EngineLine {
  move: string;
  pv: string[];
  score: EngineScore;
  depth: number;
}
export interface AnalyzeResult {
  lines: EngineLine[];
  bestmove: string;
}
export interface AnalyzeOpts {
  depth?: number;
  multipv?: number;
  movetime?: number;
  /** Stockfish "Skill Level" 0–20 (default 20). */
  skill?: number;
  onInfo?: (lines: EngineLine[]) => void;
}

/** Score in centipawns from the side to move; mates become large numbers. */
export function scoreCp(s: EngineScore | undefined): number {
  if (!s) return 0;
  if (s.mate != null) return s.mate > 0 ? 100000 - s.mate * 100 : -100000 - s.mate * 100;
  return s.cp ?? 0;
}

type Job = { fen: string; opts: AnalyzeOpts; resolve: (r: AnalyzeResult) => void; reject: (e: unknown) => void };

class Engine {
  private worker: Worker | null = null;
  private listeners: ((line: string) => void)[] = [];
  private queue: Job[] = [];
  private running = false;
  private failed = false;
  private readyPromise: Promise<void> | null = null;

  get available() {
    return !this.failed;
  }

  private start(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('stockfish/stockfish-19-lite-single.js');
        this.worker.onmessage = (e) => {
          const line = String(e.data);
          for (const l of [...this.listeners]) l(line);
        };
        this.worker.onerror = (e) => {
          this.failed = true;
          reject(e);
        };
        const onLine = (l: string) => {
          if (l === 'uciok') {
            this.listeners = this.listeners.filter((x) => x !== onLine);
            this.send('setoption name Hash value 32');
            resolve();
          }
        };
        this.listeners.push(onLine);
        this.send('uci');
      } catch (e) {
        this.failed = true;
        reject(e);
      }
    });
    return this.readyPromise;
  }

  private send(cmd: string) {
    this.worker?.postMessage(cmd);
  }

  analyze(fen: string, opts: AnalyzeOpts = {}): Promise<AnalyzeResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fen, opts, resolve, reject });
      void this.pump();
    });
  }

  /** Drops queued jobs and stops the running search (it resolves with what it has). */
  cancel() {
    const dropped = this.queue.splice(0);
    for (const j of dropped) j.resolve({ lines: [], bestmove: '' });
    if (this.running) this.send('stop');
  }

  newGame() {
    this.cancel();
    this.send('ucinewgame');
  }

  private async pump() {
    if (this.running) return;
    const job = this.queue.shift();
    if (!job) return;
    this.running = true;
    try {
      await this.start();
      const r = await this.run(job.fen, job.opts);
      job.resolve(r);
    } catch (e) {
      job.reject(e);
    } finally {
      this.running = false;
      void this.pump();
    }
  }

  private run(fen: string, opts: AnalyzeOpts): Promise<AnalyzeResult> {
    return new Promise((resolve) => {
      const lines = new Map<number, EngineLine>();
      const multipv = opts.multipv ?? 1;
      let lastEmit = 0;
      const onLine = (line: string) => {
        if (line.startsWith('info ') && line.includes(' pv ') && !line.includes('bound')) {
          const d = Number(line.match(/ depth (\d+)/)?.[1] ?? 0);
          const mpv = Number(line.match(/ multipv (\d+)/)?.[1] ?? 1);
          const cp = line.match(/ score cp (-?\d+)/);
          const mate = line.match(/ score mate (-?\d+)/);
          const pv = line.split(' pv ')[1].trim().split(/\s+/);
          lines.set(mpv, { move: pv[0], pv, depth: d, score: mate ? { mate: Number(mate[1]) } : { cp: Number(cp?.[1] ?? 0) } });
          if (opts.onInfo && Date.now() - lastEmit > 120) {
            lastEmit = Date.now();
            opts.onInfo([...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v));
          }
        } else if (line.startsWith('bestmove')) {
          this.listeners = this.listeners.filter((x) => x !== onLine);
          const bestmove = line.split(/\s+/)[1] ?? '';
          const out = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
          if (!out.length && bestmove && bestmove !== '(none)') out.push({ move: bestmove, pv: [bestmove], depth: 0, score: { cp: 0 } });
          opts.onInfo?.(out);
          resolve({ lines: out, bestmove: bestmove === '(none)' ? '' : bestmove });
        }
      };
      this.listeners.push(onLine);
      this.send(`setoption name Skill Level value ${opts.skill ?? 20}`);
      this.send(`setoption name MultiPV value ${multipv}`);
      this.send(`position fen ${fen}`);
      this.send(opts.movetime ? `go movetime ${opts.movetime}` : `go depth ${opts.depth ?? 12}`);
    });
  }
}

export const engine = new Engine();
