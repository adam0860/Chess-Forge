import { useRef } from 'react';
import { Board } from '../chess/Board';
import { BOARDS, PIECE_SETS, isUnlocked, unlockLabel } from '../lib/themes';
import { defaultProgress, exportData, importData, progressStore, setSettings, useProgress, useSettings, type Accent, type ThemePref } from '../lib/store';
import { levelInfo, STAGES } from '../lib/progress';
import { confirmDialog, toast } from '../lib/ui';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';
import type { StageId } from '../content/types';

const PREVIEW = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';

export function SettingsScreen() {
  const s = useSettings();
  const p = useProgress();
  const level = levelInfo(p.xp).level;
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-forge-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      <section className="settings-section">
        <h2 className="sheet-sub">Appearance</h2>
        <div className="card settings-card">
          <div className="set-row">
            <span>
              <b>Theme</b>
            </span>
            <div className="seg">
              {(['dark', 'light', 'midnight', 'system'] as ThemePref[]).map((t) => (
                <button key={t} type="button" className={`seg-btn${s.theme === t ? ' on' : ''}`} onClick={() => setSettings({ theme: t })}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span>
              <b>Accent colour</b>
            </span>
            <div className="swatches">
              {(['ember', 'ocean', 'emerald', 'violet', 'rose'] as Accent[]).map((a) => (
                <button key={a} type="button" className={`swatch sw-${a}${s.accent === a ? ' on' : ''}`} onClick={() => setSettings({ accent: a })} aria-label={a} />
              ))}
            </div>
          </div>
          <div className="set-row col">
            <span>
              <b>Board</b>
            </span>
            <div className="theme-picker">
              {BOARDS.map((b) => {
                const open = isUnlocked(b.unlock, level, p.achievements);
                return (
                  <button key={b.id} type="button" className={`theme-swatch${s.board === b.id ? ' on' : ''}${open ? '' : ' locked'}`} onClick={() => open && setSettings({ board: b.id })} title={open ? b.name : unlockLabel(b.unlock!)}>
                    <span className="mini-board" style={{ background: `conic-gradient(${b.dark} 0 25%, ${b.light} 0 50%, ${b.dark} 0 75%, ${b.light} 0)`, backgroundSize: '50% 50%' }} />
                    <small>{b.name}</small>
                    {!open && (
                      <span className="lock-badge">
                        <Icon name="lock" size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="set-row col">
            <span>
              <b>Pieces</b>
            </span>
            <div className="theme-picker">
              {PIECE_SETS.map((ps) => {
                const open = isUnlocked(ps.unlock, level, p.achievements);
                return (
                  <button key={ps.id} type="button" className={`theme-swatch pieces${s.pieces === ps.id ? ' on' : ''}${open ? '' : ' locked'}`} onClick={() => open && setSettings({ pieces: ps.id })} title={open ? ps.name : unlockLabel(ps.unlock!)}>
                    <span className="piece-duo">
                      <span style={{ background: ps.vars.wFill, borderColor: ps.vars.wLine }} />
                      <span style={{ background: ps.vars.bFill, borderColor: ps.vars.bLine }} />
                    </span>
                    <small>{ps.name}</small>
                    {!open && (
                      <span className="lock-badge">
                        <Icon name="lock" size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="settings-preview">
            <Board fen={PREVIEW} lastMove={['f8', 'c5']} />
          </div>
          <Toggle label="Coordinates" desc="Show file and rank labels on the board." checked={s.coordinates} onChange={(v) => setSettings({ coordinates: v })} />
          <Toggle label="Legal-move dots" desc="Show where the selected piece can go." checked={s.legalDots} onChange={(v) => setSettings({ legalDots: v })} />
          <div className="set-row">
            <span>
              <b>Piece animation</b>
            </span>
            <div className="seg">
              {(['fast', 'normal', 'slow'] as const).map((a) => (
                <button key={a} type="button" className={`seg-btn${s.animation === a ? ' on' : ''}`} onClick={() => setSettings({ animation: a })}>
                  {a[0].toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span>
              <b>Text size</b>
            </span>
            <div className="seg">
              {[1, 1.15, 1.3, 1.5].map((v) => (
                <button key={v} type="button" className={`seg-btn${s.textScale === v ? ' on' : ''}`} onClick={() => setSettings({ textScale: v })}>
                  {Math.round(v * 100)}%
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span>
              <b>Motion</b>
              <small className="muted">Reduced turns off animations and celebrations.</small>
            </span>
            <div className="seg">
              {(['system', 'full', 'reduced'] as const).map((m) => (
                <button key={m} type="button" className={`seg-btn${s.motion === m ? ' on' : ''}`} onClick={() => setSettings({ motion: m })}>
                  {m[0].toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="sheet-sub">Sound and feel</h2>
        <div className="card settings-card">
          <Toggle label="Sound effects" desc="Moves, captures, checks and rewards." checked={s.sound} onChange={(v) => { setSettings({ sound: v }); if (v) setTimeout(() => sfx.move(), 50); }} />
          <div className="set-row">
            <span>
              <b>Volume</b>
            </span>
            <input type="range" min={0} max={1} step={0.05} value={s.volume} onChange={(e) => setSettings({ volume: Number(e.target.value) })} onPointerUp={() => sfx.capture()} className="range" />
          </div>
          <Toggle label="Haptics" desc="Vibration on Android for captures, checks and results." checked={s.haptics} onChange={(v) => setSettings({ haptics: v })} />
          <Toggle label="Celebrations" desc="Confetti for big achievements." checked={s.celebrations} onChange={(v) => setSettings({ celebrations: v })} />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="sheet-sub">Play</h2>
        <div className="card settings-card">
          <Toggle label="Always promote to a queen" desc="Skip the promotion picker." checked={s.autoQueen} onChange={(v) => setSettings({ autoQueen: v })} />
          <Toggle label="Confirm before resigning" checked={s.confirmResign} onChange={(v) => setSettings({ confirmResign: v })} />
        </div>
      </section>

      <section className="settings-section">
        <h2 className="sheet-sub">Learning</h2>
        <div className="card settings-card">
          <div className="set-row">
            <span>
              <b>Daily goal</b>
            </span>
            <div className="seg">
              {[20, 50, 100, 200].map((g) => (
                <button key={g} type="button" className={`seg-btn${s.dailyGoal === g ? ' on' : ''}`} onClick={() => setSettings({ dailyGoal: g })}>
                  {g} XP
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span>
              <b>Starting stage</b>
              <small className="muted">Unlocks opponents and sets where “Continue” begins.</small>
            </span>
            <select className="select" value={s.startStage} onChange={(e) => setSettings({ startStage: Number(e.target.value) as StageId })}>
              {STAGES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id}. {st.name} ({st.range})
                </option>
              ))}
            </select>
          </div>
          <div className="set-row">
            <span>
              <b>Your name</b>
            </span>
            <input className="input" value={s.name} maxLength={24} placeholder="Name" onChange={(e) => setSettings({ name: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="sheet-sub">Your data</h2>
        <div className="card settings-card">
          <div className="set-row">
            <span>
              <b>Back up progress</b>
              <small className="muted">Everything is stored on this device. Export it to move to another device.</small>
            </span>
            <div className="row-actions">
              <button type="button" className="btn btn-soft btn-sm" onClick={doExport}>
                <Icon name="download" size={16} /> Export
              </button>
              <button type="button" className="btn btn-soft btn-sm" onClick={() => fileRef.current?.click()}>
                <Icon name="upload" size={16} /> Import
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const ok = importData(await f.text());
                  toast({ icon: ok ? 'check' : 'warning', title: ok ? 'Progress imported' : 'That file is not a Chess Forge backup' });
                  e.target.value = '';
                }}
              />
            </div>
          </div>
          <div className="set-row">
            <span>
              <b>Reset progress</b>
              <small className="muted">Deletes lessons, drills, puzzles, games and trophies.</small>
            </span>
            <button
              type="button"
              className="btn btn-danger-soft btn-sm"
              onClick={async () => {
                if (await confirmDialog({ title: 'Reset all progress?', body: 'This cannot be undone. Export a backup first if you might want it later.', confirmLabel: 'Reset everything', danger: true })) {
                  progressStore.replace({ ...defaultProgress, createdAt: Date.now() });
                  toast({ icon: 'refresh', title: 'Progress reset' });
                }
              }}
            >
              <Icon name="trash" size={16} /> Reset
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="sheet-sub">About</h2>
        <div className="card settings-card about">
          <p>
            <b>Chess Forge</b> {__APP_VERSION__}. Part of the Forge family alongside STEM Forge, Python Forge and C++ Forge.
          </p>
          <p className="muted small">
            Chess engine: Stockfish (stockfish.js WASM build by Nathan Rugg), licensed under the GNU GPL v3. Piece artwork: the “cburnett” set by Colin M. L. Burnett, CC BY-SA 3.0. Puzzles were generated from Stockfish self-play and verified to have a unique solution.
          </p>
        </div>
      </section>
    </>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="set-row toggle-row">
      <span>
        <b>{label}</b>
        {desc && <small className="muted">{desc}</small>}
      </span>
      <input type="checkbox" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
