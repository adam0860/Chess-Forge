import { MODULES } from '../content/curriculum';
import { OPENINGS } from '../content/openings';
import { ACHIEVEMENTS } from '../lib/achievements';
import { navigate } from '../lib/router';
import { useProgress, useSettings } from '../lib/store';
import { currentStage, effectiveStreak, levelInfo, MASTERED_BOX, STAGES } from '../lib/progress';
import { formatMinutes } from '../lib/dates';
import { Icon } from '../components/Icon';
import { ProgressRing, StatTile, StreakCalendar } from '../components/ui';
import { GameHistory } from './PlayScreen';

export function ProfileScreen() {
  const p = useProgress();
  const s = useSettings();
  const lvl = levelInfo(p.xp);
  const stage = currentStage(p);
  const lessonsTotal = MODULES.reduce((n, m) => n + m.lessons.length, 0);
  const learned = OPENINGS.filter((o) => p.openings[o.id]?.learnedAt).length;
  const mastered = Object.values(p.cards).filter((c) => c.box >= MASTERED_BOX).length;
  const wins = Object.values(p.bots).reduce((n, b) => n + b.w, 0);
  const groups = ['Learning', 'Openings', 'Puzzles', 'Play', 'Dedication'] as const;
  const earned = ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length;
  return (
    <>
      <div className="profile-hero card">
        <ProgressRing value={lvl.progress} size={104} stroke={8}>
          <small>Level</small>
          <b className="big-num">{lvl.level}</b>
        </ProgressRing>
        <div className="grow">
          <h1>{s.name || 'Chess player'}</h1>
          <p className="muted">
            Stage {stage}: {STAGES[stage - 1].name} ({STAGES[stage - 1].range}) · {p.xp} XP · {lvl.next - p.xp} XP to level {lvl.level + 1}
          </p>
          <div className="stage-track">
            {STAGES.map((st) => (
              <span key={st.id} className={`stage-pip${stage >= st.id ? ' on' : ''}`} title={st.name}>
                {st.id}
              </span>
            ))}
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={() => navigate('/settings')} aria-label="Settings">
          <Icon name="settings" size={22} />
        </button>
      </div>

      <div className="stat-grid">
        <StatTile icon="flame" label="Day streak" value={effectiveStreak(p)} tone="streak" />
        <StatTile icon="learn" label={`of ${lessonsTotal} lessons`} value={Object.keys(p.lessons).length} />
        <StatTile icon="book" label="Openings learned" value={`${learned}/${OPENINGS.length}`} />
        <StatTile icon="target" label="Positions mastered" value={mastered} tone="gold" />
        <StatTile icon="gauge" label="Puzzle rating" value={p.puzzle.rating} />
        <StatTile icon="puzzle" label="Puzzles solved" value={p.puzzle.solved} />
        <StatTile icon="trophy" label="Games won" value={wins} />
        <StatTile icon="clock" label="Time training" value={formatMinutes(p.stats.seconds)} />
      </div>

      <h2 className="section-title">Activity</h2>
      <div className="card">
        <StreakCalendar dailyXp={p.dailyXp} frozen={p.streak.frozenDays} goal={s.dailyGoal} weeks={26} />
        <p className="muted small" style={{ marginTop: 10 }}>
          Best streak: {p.streak.best} days. Every 7-day streak earns a streak freeze (up to 2), which protects one missed day.
        </p>
      </div>

      <h2 className="section-title">
        Trophies <span className="muted small">{earned}/{ACHIEVEMENTS.length}</span>
      </h2>
      {groups.map((g) => (
        <div key={g} className="trophy-group">
          <div className="sheet-sub">{g}</div>
          <div className="trophy-grid">
            {ACHIEVEMENTS.filter((a) => a.group === g).map((a) => {
              const at = p.achievements[a.id];
              return (
                <div key={a.id} className={`trophy${at ? ' earned' : ''}`} title={a.desc}>
                  <span className="trophy-icon">
                    <Icon name={at ? a.icon : 'lock'} size={22} />
                  </span>
                  <b>{a.title}</b>
                  <small className="muted">{a.desc}</small>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {p.games.length > 0 && (
        <>
          <h2 className="section-title">Game history</h2>
          <GameHistory />
        </>
      )}
    </>
  );
}
