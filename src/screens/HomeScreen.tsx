import { OPENINGS } from '../content/openings';
import { Board } from '../chess/Board';
import { BOTS } from '../chess/bots';
import { buildOpening } from '../lib/openings';
import { navigate } from '../lib/router';
import { useProgress, useSettings } from '../lib/store';
import { currentStage, dueMistakes, effectiveStreak, levelInfo, nextLesson, STAGES, todayXp } from '../lib/progress';
import { dayKey, greeting } from '../lib/dates';
import { dailyPuzzle } from './PuzzlesScreen';
import { botUnlocked } from './PlayScreen';
import { Icon } from '../components/Icon';
import { BotAvatar, ProgressRing, StreakCalendar } from '../components/ui';
import { Chess } from 'chess.js';

export function HomeScreen() {
  const p = useProgress();
  const s = useSettings();
  const streak = effectiveStreak(p);
  const lvl = levelInfo(p.xp);
  const today = todayXp(p);
  const stage = currentStage(p);
  const next = nextLesson(p);
  const daily = dailyPuzzle();
  const dailyDone = p.puzzle.dailyDone === dayKey();
  const dueCards = Object.values(p.cards).filter((c) => c.due <= Date.now()).length;
  const mistakes = dueMistakes(p).length;
  const dueOpening = OPENINGS.map((o) => ({ o, due: buildOpening(o).cards.filter((c) => p.cards[c.id] && p.cards[c.id].due <= Date.now()).length })).sort((a, b) => b.due - a.due)[0];
  const suggestedBot = [...BOTS].reverse().find((b) => botUnlocked(b, stage, p.bots)) ?? BOTS[0];
  const dailyFen = (() => {
    const c = new Chess(daily.fen);
    c.move({ from: daily.moves[0].slice(0, 2), to: daily.moves[0].slice(2, 4), promotion: daily.moves[0][4] });
    return c.fen();
  })();

  return (
    <>
      <div className="home-head">
        <div>
          <span className="eyebrow">{greeting()}</span>
          <h1>{s.name ? `Ready, ${s.name}?` : 'Ready to train?'}</h1>
          <p className="muted">
            Stage {stage}: {STAGES[stage - 1].name} · Level {lvl.level}
          </p>
        </div>
        <div className="home-chips">
          <span className={`chip-stat streak${streak > 0 ? ' lit' : ''}`} title="Day streak">
            <Icon name="flame" size={18} filled={streak > 0} /> {streak}
          </span>
          <span className="chip-stat level" title="Total XP">
            <Icon name="zap" size={18} filled /> {p.xp}
          </span>
        </div>
      </div>

      <div className="home-grid">
        <div className="card continue-card">
          {next ? (
            <>
              <span className="eyebrow">
                <Icon name="learn" size={14} /> Continue learning · Module {next.module.num}
              </span>
              <h2>{next.lesson.title}</h2>
              <p className="muted">
                {next.module.title} · {next.lesson.summary}
              </p>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate(`/lesson/${next.lesson.id}`)}>
                <Icon name="play" size={18} filled /> {p.lessons[next.lesson.id] ? 'Review' : 'Start lesson'}
              </button>
            </>
          ) : (
            <>
              <span className="eyebrow">Course complete</span>
              <h2>Every lesson finished!</h2>
              <p className="muted">Keep sharp with puzzles, drills and games.</p>
            </>
          )}
        </div>
        <div className="card goal-card">
          <ProgressRing value={today / s.dailyGoal} size={92} stroke={8} color="var(--gold)">
            <b>{today}</b>
            <small>/ {s.dailyGoal} XP</small>
          </ProgressRing>
          <div>
            <b>Daily goal</b>
            <p className="muted small">{today >= s.dailyGoal ? 'Goal reached. Great work!' : `${s.dailyGoal - today} XP to go today.`}</p>
            {p.streak.freezes > 0 && (
              <span className="pill">
                <Icon name="shield" size={12} /> {p.streak.freezes} streak freeze{p.streak.freezes > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <h2 className="section-title">Today’s training</h2>
      <div className="today-grid">
        <button type="button" className={`today-card${dailyDone ? ' done' : ''}`} onClick={() => navigate('/puzzle/daily')}>
          <div className="today-board">
            <Board fen={dailyFen} orientation={new Chess(dailyFen).turn()} coordinates={false} />
          </div>
          <div className="today-text">
            <b>Daily puzzle</b>
            <small className="muted">{dailyDone ? 'Solved. Come back tomorrow!' : `Rated ${daily.rating} · +20 XP`}</small>
          </div>
        </button>
        <button type="button" className="today-card" onClick={() => navigate(dueOpening && dueOpening.due ? `/drill/${dueOpening.o.id}?mode=line` : '/openings')}>
          <span className="today-icon gold">
            <Icon name="target" size={26} />
          </span>
          <div className="today-text">
            <b>Opening review</b>
            <small className="muted">{dueCards ? `${dueCards} position${dueCards > 1 ? 's' : ''} due${dueOpening?.due ? ` · start with ${dueOpening.o.name}` : ''}` : 'Learn an opening to start reviewing.'}</small>
          </div>
        </button>
        <button type="button" className="today-card" onClick={() => navigate(mistakes ? '/puzzle/mistakes' : '/puzzle/rated')}>
          <span className="today-icon">
            <Icon name={mistakes ? 'refresh' : 'puzzle'} size={26} />
          </span>
          <div className="today-text">
            <b>{mistakes ? 'Fix your mistakes' : 'Rated puzzles'}</b>
            <small className="muted">{mistakes ? `${mistakes} position${mistakes > 1 ? 's' : ''} from your games` : `Your rating: ${p.puzzle.rating}`}</small>
          </div>
        </button>
        <button type="button" className="today-card" onClick={() => navigate('/play')}>
          <BotAvatar bot={suggestedBot} size={48} />
          <div className="today-text">
            <b>Play {suggestedBot.name}</b>
            <small className="muted">
              ~{suggestedBot.elo} · {suggestedBot.title}
            </small>
          </div>
        </button>
      </div>

      <h2 className="section-title">Your streak</h2>
      <div className="card">
        <StreakCalendar dailyXp={p.dailyXp} frozen={p.streak.frozenDays} goal={s.dailyGoal} weeks={18} />
        <div className="cal-legend muted small">
          <span>
            Current {streak} · Best {p.streak.best}
          </span>
          <span className="grow" />
          Less <i className="cal-day l1" /> <i className="cal-day l2" /> <i className="cal-day l3" /> <i className="cal-day l4" /> More
        </div>
      </div>
    </>
  );
}
