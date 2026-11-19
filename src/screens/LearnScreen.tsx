import { MODULES, getModule } from '../content/curriculum';
import { PieceGlyph } from '../chess/Board';
import { navigate } from '../lib/router';
import { useProgress } from '../lib/store';
import { checkpointPassed, currentStage, moduleProgress, STAGES } from '../lib/progress';
import { Icon } from '../components/Icon';
import { Bar, ProgressRing } from '../components/ui';
import { NotFound } from './NotFound';

export function LearnScreen() {
  const p = useProgress();
  const stage = currentStage(p);
  return (
    <>
      <div className="page-head">
        <h1>Learn</h1>
        <p className="muted">Eleven modules, from the rules to strong club play. Each ends with a checkpoint.</p>
      </div>
      {STAGES.map((s) => {
        const mods = MODULES.filter((m) => m.stage === s.id);
        return (
          <section key={s.id} className="stage-block">
            <div className={`stage-head${stage >= s.id ? ' reached' : ''}`}>
              <span className="stage-num">{s.id}</span>
              <div>
                <h2>{s.name}</h2>
                <span className="muted small">Approx. {s.range}</span>
              </div>
              {stage === s.id && <span className="pill accent">You are here</span>}
            </div>
            <div className="module-grid">
              {mods.map((m) => {
                const mp = moduleProgress(p, m.id);
                const passed = checkpointPassed(p, m.id);
                return (
                  <button key={m.id} type="button" className="module-card" onClick={() => navigate(`/module/${m.id}`)}>
                    <span className="module-badge">
                      <PieceGlyph code={(m.num % 2 ? 'w' : 'b') + m.icon.toLowerCase()} size={34} />
                    </span>
                    <span className="module-text">
                      <span className="eyebrow">Module {m.num}</span>
                      <b>{m.title}</b>
                      <small className="muted">{m.blurb}</small>
                      <span className="module-meta">
                        <Bar value={mp.pct} tone={passed ? 'success' : undefined} />
                        <span className="small muted">
                          {mp.done}/{mp.total}
                        </span>
                        {passed && <Icon name="check" size={16} className="good-text" strokeWidth={3} />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}

export function ModuleScreen({ moduleId }: { moduleId: string }) {
  const p = useProgress();
  const m = getModule(moduleId);
  if (!m) return <NotFound />;
  const mp = moduleProgress(p, m.id);
  const firstOpen = m.lessons.find((l) => !p.lessons[l.id]);
  return (
    <>
      <button type="button" className="back-link" onClick={() => navigate('/learn')}>
        <Icon name="arrow-left" size={18} /> All modules
      </button>
      <div className="module-hero">
        <span className="module-badge big">
          <PieceGlyph code={(m.num % 2 ? 'w' : 'b') + m.icon.toLowerCase()} size={58} />
        </span>
        <div>
          <span className="eyebrow">
            Module {m.num} · Stage {m.stage}
          </span>
          <h1>{m.title}</h1>
          <p className="muted">{m.blurb}</p>
        </div>
        <ProgressRing value={mp.pct} size={64} stroke={6}>
          <b>{Math.round(mp.pct * 100)}%</b>
        </ProgressRing>
      </div>
      {firstOpen && (
        <button type="button" className="btn btn-primary btn-lg continue-btn" onClick={() => navigate(`/lesson/${firstOpen.id}`)}>
          <Icon name="play" size={18} filled /> {mp.done ? 'Continue' : 'Start'}: {firstOpen.title}
        </button>
      )}
      <ol className="lesson-path">
        {m.lessons.map((l, i) => {
          const lp = p.lessons[l.id];
          const state = lp ? (l.checkpoint ? (lp.bestAccuracy >= 0.8 ? 'done' : 'failed') : 'done') : l.id === firstOpen?.id ? 'current' : 'todo';
          return (
            <li key={l.id} className={`lesson-node ${state}${l.checkpoint ? ' checkpoint' : ''}`}>
              <button type="button" onClick={() => navigate(`/lesson/${l.id}`)}>
                <span className="node-dot">
                  {state === 'done' ? <Icon name="check" size={18} strokeWidth={3} /> : l.checkpoint ? <Icon name="flag" size={18} /> : i + 1}
                </span>
                <span className="node-text">
                  <b>{l.title}</b>
                  <small className="muted">
                    {l.summary} · {l.minutes} min
                    {lp && ` · best ${Math.round(lp.bestAccuracy * 100)}%`}
                  </small>
                </span>
                <Icon name="chevron-right" size={18} className="muted" />
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}
