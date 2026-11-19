import { Fragment, type ReactNode } from 'react';
import { addDays, dayKey } from '../lib/dates';
import { PieceGlyph } from '../chess/Board';
import { Icon } from './Icon';
import type { Bot } from '../chess/bots';

/** Tiny markdown: paragraphs, **bold**, *italic*, bullet and numbered lists. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className={`rich ${className ?? ''}`}>
      {blocks.map((b, i) => {
        const lines = b.split('\n');
        if (lines.every((l) => /^\s*[-•]\s/.test(l)))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•]\s/, ''))}</li>
              ))}
            </ul>
          );
        if (lines.every((l) => /^\s*\d+\.\s/.test(l)))
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+\.\s/, ''))}</li>
              ))}
            </ol>
          );
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    out.push(m[1] ? <b key={k++}>{m[1]}</b> : <i key={k++}>{m[2]}</i>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export function ProgressRing({ value, size = 44, stroke = 4, children, color }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? 'var(--accent)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s var(--ease-out)' }}
        />
      </svg>
      {children && <span className="ring-inner">{children}</span>}
    </span>
  );
}

export function Bar({ value, tone }: { value: number; tone?: 'gold' | 'success' }) {
  return (
    <div className={`bar${tone ? ` bar-${tone}` : ''}`}>
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

/** Streak calendar: the last N weeks as a grid of days, filled when active. */
export function StreakCalendar({ dailyXp, frozen = [], weeks = 15, goal }: { dailyXp: Record<string, number>; frozen?: string[]; weeks?: number; goal: number }) {
  const today = new Date();
  const start = addDays(today, -(weeks * 7 - 1) - ((today.getDay() + 6) % 7 === 6 ? 0 : 6 - ((today.getDay() + 6) % 7)));
  const cols: { key: string; xp: number; future: boolean; frozen: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const key = dayKey(date);
      col.push({ key, xp: dailyXp[key] ?? 0, future: date > today, frozen: frozen.includes(key) });
    }
    cols.push(col);
  }
  return (
    <div className="cal" role="img" aria-label="Activity calendar">
      {cols.map((col, i) => (
        <div key={i} className="cal-col">
          {col.map((d) => {
            const lvl = d.future ? -1 : d.xp === 0 ? 0 : d.xp < goal / 2 ? 1 : d.xp < goal ? 2 : d.xp < goal * 2 ? 3 : 4;
            return <span key={d.key} className={`cal-day l${lvl}${d.frozen ? ' frozen' : ''}${d.key === dayKey(today) ? ' today' : ''}`} title={`${d.key}: ${d.xp} XP`} />;
          })}
        </div>
      ))}
    </div>
  );
}

export function BotAvatar({ bot, size = 52 }: { bot: Bot; size?: number }) {
  return (
    <span className="bot-avatar" style={{ width: size, height: size, background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${bot.color} 85%, white), ${bot.color} 60%, color-mix(in srgb, ${bot.color} 55%, black))` }}>
      <PieceGlyph code={bot.glyph} size={size * 0.72} />
    </span>
  );
}

export function StatTile({ icon, label, value, tone }: { icon: string; label: string; value: ReactNode; tone?: string }) {
  return (
    <div className={`stat-tile${tone ? ` tone-${tone}` : ''}`}>
      <span className="stat-icon">
        <Icon name={icon} size={20} />
      </span>
      <span className="stat-text">
        <b>{value}</b>
        <small>{label}</small>
      </span>
    </div>
  );
}

export function EvalBar({ cp, mate, orientation }: { cp: number; mate?: number | null; orientation: 'w' | 'b' }) {
  const clamped = mate != null ? (mate > 0 ? 1000 : -1000) : Math.max(-1000, Math.min(1000, cp));
  const white = 50 + 50 * (2 / (1 + Math.exp(-0.004 * clamped)) - 1);
  const label = mate != null ? `M${Math.abs(mate)}` : (Math.abs(cp) / 100).toFixed(1);
  const whiteAhead = mate != null ? mate > 0 : cp >= 0;
  return (
    <div className={`eval-bar${orientation === 'b' ? ' flipped' : ''}`} aria-label={`Evaluation ${whiteAhead ? '+' : '−'}${label}`}>
      <div className="eval-bar-fill" style={{ height: `${white}%` }} />
      <span className="eval-bar-label" style={whiteAhead === (orientation === 'w') ? { bottom: 3, color: '#333' } : { top: 3, color: '#eee' }}>
        {label}
      </span>
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; icon?: string; badge?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} className={`tab${value === t.id ? ' on' : ''}`} onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size={17} />}
          {t.label}
          {!!t.badge && <span className="tab-badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
