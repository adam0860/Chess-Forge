import { useEffect, type ReactNode } from 'react';
import { isDesktopApp, onBackButton, syncSystemBars } from './lib/platform';
import { canGoBack, goBack, navigate, useRoute } from './lib/router';
import { useProgress, useSettings, type Settings } from './lib/store';
import { dueMistakes, effectiveStreak, levelInfo } from './lib/progress';
import { closeTopOverlay, runBackHandlers, useUi } from './lib/ui';
import { useReducedMotion } from './lib/motion';
import { Icon } from './components/Icon';
import { Modal } from './components/Modal';
import { HomeScreen } from './screens/HomeScreen';
import { LearnScreen, ModuleScreen } from './screens/LearnScreen';
import { LessonScreen } from './screens/LessonScreen';
import { OpeningScreen, OpeningsScreen } from './screens/OpeningsScreen';
import { DrillScreen } from './screens/DrillScreen';
import { PlayScreen } from './screens/PlayScreen';
import { GameScreen } from './screens/GameScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { PuzzleSession, PuzzlesHub } from './screens/PuzzlesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LogoMark, Onboarding } from './screens/Onboarding';
import { NotFound } from './screens/NotFound';

const NAV = [
  { id: 'home', label: 'Home', icon: 'home', to: '/' },
  { id: 'learn', label: 'Learn', icon: 'learn', to: '/learn' },
  { id: 'openings', label: 'Openings', icon: 'book-open', to: '/openings' },
  { id: 'play', label: 'Play', icon: 'swords', to: '/play' },
  { id: 'puzzles', label: 'Puzzles', icon: 'puzzle', to: '/puzzles' },
  { id: 'profile', label: 'Profile', icon: 'user', to: '/profile' },
] as const;

function useTheme(s: Settings) {
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = s.theme === 'system' ? (mq.matches ? 'dark' : 'light') : s.theme;
      root.dataset.theme = theme;
      root.dataset.accent = s.accent;
      root.style.setProperty('--text-scale', String(s.textScale));
      const bg = getComputedStyle(root).getPropertyValue('--bg').trim() || '#121318';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
      void syncSystemBars(theme !== 'light', bg);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [s.theme, s.accent, s.textScale]);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);
}

export function App() {
  const s = useSettings();
  const route = useRoute();
  useTheme(s);

  useEffect(() => {
    void onBackButton(() => {
      if (closeTopOverlay()) return true;
      if (runBackHandlers()) return true;
      if (window.location.hash.replace('#', '') === '/' || window.location.hash === '') return false;
      if (canGoBack()) goBack();
      else navigate('/', { replace: true });
      return true;
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  const [first, second] = route.segments;
  let screen: ReactNode;
  let fullscreen = false;
  let active = '';
  switch (first) {
    case undefined:
      screen = <HomeScreen />;
      active = 'home';
      break;
    case 'learn':
      screen = <LearnScreen />;
      active = 'learn';
      break;
    case 'module':
      screen = <ModuleScreen moduleId={second ?? ''} />;
      active = 'learn';
      break;
    case 'lesson':
      screen = <LessonScreen key={second} lessonId={second ?? ''} />;
      fullscreen = true;
      break;
    case 'openings':
      screen = <OpeningsScreen />;
      active = 'openings';
      break;
    case 'opening':
      screen = <OpeningScreen key={second} openingId={second ?? ''} />;
      active = 'openings';
      break;
    case 'drill':
      screen = <DrillScreen key={route.query.toString() + second} openingId={second ?? ''} mode={(route.query.get('mode') as 'line') ?? 'line'} />;
      fullscreen = true;
      break;
    case 'play':
      screen = <PlayScreen />;
      active = 'play';
      break;
    case 'game':
      screen = <GameScreen key={route.query.toString()} />;
      fullscreen = true;
      break;
    case 'review':
      screen = <ReviewScreen key={second} gameId={second ?? ''} />;
      active = 'play';
      break;
    case 'puzzles':
      screen = <PuzzlesHub />;
      active = 'puzzles';
      break;
    case 'puzzle':
      screen = <PuzzleSession key={(second ?? '') + route.query.toString()} mode={second ?? 'rated'} />;
      fullscreen = true;
      break;
    case 'profile':
      screen = <ProfileScreen />;
      active = 'profile';
      break;
    case 'settings':
      screen = <SettingsScreen />;
      active = 'settings';
      break;
    default:
      screen = <NotFound />;
  }

  return (
    <>
      {!s.onboarded ? (
        <Onboarding />
      ) : fullscreen ? (
        <div className="fullscreen">{screen}</div>
      ) : (
        <div className="shell">
          <Sidebar active={active} />
          <main className="main" key={route.path}>
            <div className="page">{screen}</div>
          </main>
          <BottomNav active={active} />
        </div>
      )}
      {isDesktopApp && <div className="titlebar-drag" aria-hidden="true" />}
      <Toasts />
      <ConfirmHost />
    </>
  );
}

function Sidebar({ active }: { active: string }) {
  const p = useProgress();
  const s = useSettings();
  const streak = effectiveStreak(p);
  const lvl = levelInfo(p.xp);
  return (
    <aside className="sidebar">
      <button type="button" className="brand" onClick={() => navigate('/')}>
        <span className="brand-mark">
          <LogoMark size={36} />
        </span>
        <span className="brand-text">
          <b>Chess Forge</b>
          <small>Train to the next level</small>
        </span>
      </button>
      <nav className="side-nav">
        {NAV.map((n) => (
          <button key={n.id} type="button" className={`side-link${active === n.id ? ' on' : ''}`} onClick={() => navigate(n.to)}>
            <Icon name={n.icon} size={20} />
            {n.label}
          </button>
        ))}
        <button type="button" className={`side-link${active === 'settings' ? ' on' : ''}`} onClick={() => navigate('/settings')}>
          <Icon name="settings" size={20} />
          Settings
        </button>
      </nav>
      <div className="side-foot">
        <div className="side-stats">
          <span className={`chip-stat streak${streak > 0 ? ' lit' : ''}`} title="Day streak">
            <Icon name="flame" size={16} filled={streak > 0} /> {streak}
          </span>
          <span className="chip-stat level" title="Total XP">
            <Icon name="zap" size={16} filled /> {p.xp}
          </span>
        </div>
        <div className="side-level">
          <div className="side-level-top">
            <span>Level {lvl.level}</span>
            <span className="muted">{s.name || 'Player'}</span>
          </div>
          <div className="bar thin">
            <div className="bar-fill" style={{ width: `${lvl.progress * 100}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ active }: { active: string }) {
  const p = useProgress();
  const due = dueMistakes(p).length;
  const items = NAV.filter((n) => n.id !== 'home' || true).slice(0, 6);
  return (
    <nav className="bottom-nav">
      {items.map((n) => (
        <button key={n.id} type="button" className={`bottom-link${active === n.id || (n.id === 'profile' && active === 'settings') ? ' on' : ''}`} onClick={() => navigate(n.to)}>
          <span className="bottom-icon">
            <Icon name={n.icon} size={22} />
            {n.id === 'puzzles' && due > 0 && <span className="dot" />}
          </span>
          <span className="bottom-label">{n.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Toasts() {
  const { toasts } = useUi();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast tone-${t.tone ?? 'default'}`}>
          <span className="toast-icon">
            <Icon name={t.icon ?? 'info'} size={18} />
          </span>
          <span className="toast-text">
            <b>{t.title}</b>
            {t.body && <span>{t.body}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConfirmHost() {
  const { confirm } = useUi();
  if (!confirm) return null;
  return (
    <Modal open onClose={() => confirm.resolve(false)} label={confirm.title} className="confirm">
      <h2 className="sheet-title">{confirm.title}</h2>
      {confirm.body && <p className="muted">{confirm.body}</p>}
      <div className="sheet-actions">
        <button type="button" className="btn btn-soft grow" onClick={() => confirm.resolve(false)}>
          {confirm.cancelLabel ?? 'Cancel'}
        </button>
        <button type="button" className={`btn grow ${confirm.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => confirm.resolve(true)} autoFocus>
          {confirm.confirmLabel ?? 'OK'}
        </button>
      </div>
    </Modal>
  );
}
