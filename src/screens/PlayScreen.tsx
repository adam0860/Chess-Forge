import { useState } from 'react';
import { OPENINGS } from '../content/openings';
import { BOTS, type Bot } from '../chess/bots';
import { navigate } from '../lib/router';
import { setSettings, useProgress, useSettings } from '../lib/store';
import { currentStage, STAGES } from '../lib/progress';
import { Icon } from '../components/Icon';
import { BotAvatar } from '../components/ui';
import { Modal } from '../components/Modal';

export interface GameSetup {
  bot: string;
  color: 'w' | 'b' | 'random';
  time: { base: number; inc: number } | null; // minutes, seconds
  opening: string | null;
  hints: boolean;
  evalBar: boolean;
  flags: boolean;
  startFen?: string;
}

let pending: GameSetup | null = null;
export const setPendingGame = (g: GameSetup) => {
  pending = g;
};
export const takePendingGame = () => pending;

const TIMES: { label: string; value: GameSetup['time'] }[] = [
  { label: 'No clock', value: null },
  { label: '3 + 2', value: { base: 3, inc: 2 } },
  { label: '5 + 3', value: { base: 5, inc: 3 } },
  { label: '10 + 5', value: { base: 10, inc: 5 } },
  { label: '15 + 10', value: { base: 15, inc: 10 } },
];

export function botUnlocked(bot: Bot, stage: number, beaten: Record<string, { w: number }>) {
  if (stage >= bot.stage) return true;
  const i = BOTS.indexOf(bot);
  return i > 0 && (beaten[BOTS[i - 1].id]?.w ?? 0) > 0;
}

export function PlayScreen() {
  const p = useProgress();
  const s = useSettings();
  const stage = currentStage(p);
  const [chosen, setChosen] = useState<Bot | null>(null);
  return (
    <>
      <div className="page-head">
        <h1>Play</h1>
        <p className="muted">Practise full games against opponents with their own personalities. Beat one to unlock the next.</p>
      </div>
      <div className="bot-grid">
        {BOTS.map((bot) => {
          const open = botUnlocked(bot, stage, p.bots);
          const rec = p.bots[bot.id];
          return (
            <button key={bot.id} type="button" className={`bot-card big${open ? '' : ' locked'}`} onClick={() => open && setChosen(bot)} disabled={!open}>
              <BotAvatar bot={bot} size={64} />
              <span className="bot-text">
                <span className="bot-name-row">
                  <b>{bot.name}</b>
                  <span className="pill">~{bot.elo}</span>
                </span>
                <small className="bot-title">{bot.title}</small>
                <small className="muted">{bot.bio}</small>
                {rec && (
                  <small className="bot-record">
                    {rec.w}W · {rec.d}D · {rec.l}L
                  </small>
                )}
              </span>
              {!open && (
                <span className="lock-tag">
                  <Icon name="lock" size={14} /> Stage {bot.stage} or beat {BOTS[BOTS.indexOf(bot) - 1]?.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {p.games.length > 0 && (
        <>
          <h2 className="section-title">Recent games</h2>
          <GameHistory limit={6} />
        </>
      )}
      <p className="muted small center" style={{ marginTop: 24 }}>
        You are at Stage {stage}: {STAGES[stage - 1].name}. Opponent ratings are approximate.
      </p>
      {chosen && <SetupSheet bot={chosen} onClose={() => setChosen(null)} defaults={{ hints: s.coachHints, evalBar: s.coachEval, flags: s.coachFlags }} />}
    </>
  );
}

function SetupSheet({ bot, onClose, defaults }: { bot: Bot; onClose: () => void; defaults: { hints: boolean; evalBar: boolean; flags: boolean } }) {
  const [color, setColor] = useState<GameSetup['color']>('w');
  const [time, setTime] = useState<GameSetup['time']>(null);
  const [opening, setOpening] = useState<string>('');
  const [hints, setHints] = useState(defaults.hints);
  const [evalBar, setEvalBar] = useState(defaults.evalBar);
  const [flags, setFlags] = useState(defaults.flags);
  const start = () => {
    setSettings({ coachHints: hints, coachEval: evalBar, coachFlags: flags });
    const op = OPENINGS.find((o) => o.id === opening);
    setPendingGame({ bot: bot.id, color: op ? op.side : color, time, opening: opening || null, hints, evalBar, flags });
    onClose();
    navigate('/game');
  };
  return (
    <Modal open onClose={onClose} label={`Play ${bot.name}`} className="setup-sheet">
      <div className="setup-head">
        <BotAvatar bot={bot} size={58} />
        <div>
          <h2 className="sheet-title">{bot.name}</h2>
          <p className="muted small">“{bot.greet}”</p>
        </div>
      </div>
      <div className="sheet-sub">Play as</div>
      <div className="seg">
        {(['w', 'random', 'b'] as const).map((c) => (
          <button key={c} type="button" className={`seg-btn${color === c ? ' on' : ''}`} onClick={() => setColor(c)} disabled={!!opening}>
            {c === 'w' ? 'White' : c === 'b' ? 'Black' : 'Random'}
          </button>
        ))}
      </div>
      <div className="sheet-sub">Time control</div>
      <div className="seg wrap">
        {TIMES.map((t) => (
          <button key={t.label} type="button" className={`seg-btn${JSON.stringify(time) === JSON.stringify(t.value) ? ' on' : ''}`} onClick={() => setTime(t.value)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="sheet-sub">Practise an opening (optional)</div>
      <select className="select" value={opening} onChange={(e) => setOpening(e.target.value)}>
        <option value="">Any opening</option>
        <optgroup label="As White">
          {OPENINGS.filter((o) => o.side === 'w').map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="As Black">
          {OPENINGS.filter((o) => o.side === 'b').map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </optgroup>
      </select>
      <div className="sheet-sub">Coaching</div>
      <label className="toggle-row">
        <span>
          <b>Hints and takebacks</b>
          <small className="muted">Ask for help during the game.</small>
        </span>
        <input type="checkbox" className="switch" checked={hints} onChange={(e) => setHints(e.target.checked)} />
      </label>
      <label className="toggle-row">
        <span>
          <b>Move-quality flags</b>
          <small className="muted">Mark inaccuracies, mistakes and blunders as you play.</small>
        </span>
        <input type="checkbox" className="switch" checked={flags} onChange={(e) => setFlags(e.target.checked)} />
      </label>
      <label className="toggle-row">
        <span>
          <b>Evaluation bar</b>
          <small className="muted">Show who is better.</small>
        </span>
        <input type="checkbox" className="switch" checked={evalBar} onChange={(e) => setEvalBar(e.target.checked)} />
      </label>
      <div className="sheet-actions">
        <button type="button" className="btn btn-primary btn-lg grow" onClick={start}>
          <Icon name="play" size={18} filled /> Start game
        </button>
      </div>
    </Modal>
  );
}

export function GameHistory({ limit }: { limit?: number }) {
  const p = useProgress();
  const games = p.games.slice(0, limit ?? 60);
  return (
    <div className="history">
      {games.map((g) => {
        const bot = BOTS.find((b) => b.id === g.bot);
        return (
          <button key={g.id} type="button" className="history-row" onClick={() => navigate(`/review/${g.id}`)}>
            {bot && <BotAvatar bot={bot} size={36} />}
            <span className="grow">
              <b>vs {bot?.name ?? g.bot}</b>
              <small className="muted">
                {new Date(g.date).toLocaleDateString()} · {g.color === 'w' ? 'White' : 'Black'} · {Math.ceil(g.sans.length / 2)} moves · {g.reason}
              </small>
            </span>
            {g.accuracy != null && <span className="pill">{g.accuracy}%</span>}
            <span className={`result-tag ${g.result}`}>{g.result === 'win' ? 'Won' : g.result === 'loss' ? 'Lost' : 'Draw'}</span>
          </button>
        );
      })}
    </div>
  );
}
