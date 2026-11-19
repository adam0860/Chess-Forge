import { useState } from 'react';
import { Board } from '../chess/Board';
import { BOARDS } from '../lib/themes';
import { setSettings, useSettings } from '../lib/store';
import { STAGES } from '../lib/progress';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';
import type { StageId } from '../content/types';

const STAGE_DESC: Record<number, string> = {
  1: 'I am new, or I am still learning how the pieces move.',
  2: 'I know the rules and play casually, but I often lose pieces.',
  3: 'I play regularly and know some tactics and openings.',
  4: 'I am a solid club player who wants deeper strategy and endgames.',
  5: 'I am strong and want to polish my repertoire and thinking.',
};

export function Onboarding() {
  const s = useSettings();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(s.name);
  const [stage, setStage] = useState<StageId>(s.startStage);
  const next = () => {
    sfx.tap();
    setStep(step + 1);
  };
  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="onboard-dots">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i <= step ? 'on' : ''} />
          ))}
        </div>
        {step === 0 && (
          <>
            <div className="onboard-logo">
              <LogoMark size={84} />
            </div>
            <h1>Welcome to Chess Forge</h1>
            <p className="muted">Openings, tactics, strategy and endgames, with drills, puzzles and opponents to practise against. Everything you need to reach the next level.</p>
            <button type="button" className="btn btn-primary btn-lg full" onClick={next}>
              Get started <Icon name="arrow-right" size={18} />
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h1>What should we call you?</h1>
            <input className="input big" autoFocus value={name} maxLength={24} placeholder="Your name" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && next()} />
            <button type="button" className="btn btn-primary btn-lg full" onClick={next}>
              Continue
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h1>Where are you starting?</h1>
            <p className="muted">This sets your first lessons and which opponents are open. You can change it any time.</p>
            <div className="stage-pick">
              {STAGES.map((st) => (
                <button key={st.id} type="button" className={`stage-option${stage === st.id ? ' on' : ''}`} onClick={() => setStage(st.id)}>
                  <span className="stage-num">{st.id}</span>
                  <span>
                    <b>
                      {st.name} <small className="muted">{st.range}</small>
                    </b>
                    <small className="muted">{STAGE_DESC[st.id]}</small>
                  </span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary btn-lg full" onClick={next}>
              Continue
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h1>Pick your board</h1>
            <div className="onboard-board">
              <Board fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3" lastMove={['f1', 'c4']} />
            </div>
            <div className="theme-picker center">
              {BOARDS.filter((b) => !b.unlock).map((b) => (
                <button key={b.id} type="button" className={`theme-swatch${s.board === b.id ? ' on' : ''}`} onClick={() => setSettings({ board: b.id })}>
                  <span className="mini-board" style={{ background: `conic-gradient(${b.dark} 0 25%, ${b.light} 0 50%, ${b.dark} 0 75%, ${b.light} 0)`, backgroundSize: '50% 50%' }} />
                  <small>{b.name}</small>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg full"
              onClick={() => {
                sfx.complete();
                setSettings({ name: name.trim(), startStage: stage, onboarded: true });
              }}
            >
              Start training
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** The Chess Forge mark: a knight on an ember shield. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lg-ember" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2a65a" />
          <stop offset="1" stopColor="#c0502a" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#lg-ember)" />
      <path d="M22 48h22c0-9-2-16-6-21l2-6-6 2-4-4-2 6c-4 2-8 6-8 11l4 2 4-4 4 2-8 8z" fill="#fff8ee" stroke="#5a2a0a" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="31" cy="27" r="1.6" fill="#5a2a0a" />
      <rect x="19" y="47" width="28" height="5" rx="2.5" fill="#fff8ee" stroke="#5a2a0a" strokeWidth="2" />
    </svg>
  );
}
