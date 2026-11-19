import { useMemo, useState } from 'react';
import { OPENINGS, getOpening } from '../content/openings';
import { Board, PieceGlyph } from '../chess/Board';
import { BOTS } from '../chess/bots';
import { buildOpening, fullLine, type OpeningLine } from '../lib/openings';
import { navigate, useRoute } from '../lib/router';
import { useProgress } from '../lib/store';
import { markOpeningStudied, openingMastery } from '../lib/progress';
import { setPendingGame } from './PlayScreen';
import { Icon } from '../components/Icon';
import { LineExplorer } from '../components/LineExplorer';
import { BotAvatar, ProgressRing, RichText, Tabs } from '../components/ui';
import { toast } from '../lib/ui';
import { NotFound } from './NotFound';

export function OpeningsScreen() {
  const route = useRoute();
  const [side, setSide] = useState<'w' | 'b'>(route.query.get('side') === 'b' ? 'b' : 'w');
  const p = useProgress();
  const list = OPENINGS.filter((o) => o.side === side);
  return (
    <>
      <div className="page-head">
        <h1>Openings</h1>
        <p className="muted">Learn the ideas, drill the moves until they are automatic, then test them against a bot.</p>
      </div>
      <Tabs
        tabs={[
          { id: 'w', label: 'As White', badge: 0 },
          { id: 'b', label: 'As Black', badge: 0 },
        ]}
        value={side}
        onChange={(s) => {
          setSide(s);
          navigate(`/openings?side=${s}`, { replace: true });
        }}
      />
      <div className="opening-grid">
        {list.map((o) => {
          const b = buildOpening(o);
          const m = openingMastery(p, o.id, b.cards.map((c) => c.id));
          const learned = !!p.openings[o.id]?.learnedAt;
          return (
            <button key={o.id} type="button" className="opening-card" onClick={() => navigate(`/opening/${o.id}`)}>
              <div className="opening-mini">
                <Board fen={b.main.replay.fens[Math.min(6, b.main.sans.length)]} orientation={o.side} coordinates={false} />
              </div>
              <div className="opening-info">
                <span className="eyebrow">
                  {o.eco} · Stage {o.stage}
                </span>
                <b>{o.name}</b>
                <small className="muted">{o.tagline}</small>
                <span className="opening-tags">
                  {learned ? (
                    <span className="pill success">
                      <Icon name="check" size={12} strokeWidth={3} /> Learned
                    </span>
                  ) : (
                    <span className="pill">New</span>
                  )}
                  {m.due > 0 && <span className="pill accent">{m.due} due</span>}
                </span>
              </div>
              <ProgressRing value={m.pct} size={46} stroke={4} color="var(--gold)">
                <small>{Math.round(m.pct * 100)}%</small>
              </ProgressRing>
            </button>
          );
        })}
      </div>
    </>
  );
}

type Tab = 'learn' | 'drill' | 'play';
type Section = { kind: 'line'; line: OpeningLine } | { kind: 'trap'; idx: number } | { kind: 'mistake'; idx: number } | { kind: 'model' };

export function OpeningScreen({ openingId }: { openingId: string }) {
  const route = useRoute();
  const o = getOpening(openingId);
  const p = useProgress();
  const tab = (route.query.get('tab') as Tab) || 'learn';
  const built = useMemo(() => (o ? buildOpening(o) : null), [o]);
  const [section, setSection] = useState<Section | null>(null);
  if (!o || !built) return <NotFound />;
  const m = openingMastery(p, o.id, built.cards.map((c) => c.id));
  const setTab = (t: Tab) => navigate(`/opening/${o.id}?tab=${t}`, { replace: true });
  const sec: Section = section ?? { kind: 'line', line: built.main };

  let rep = built.main.replay;
  let highlightFrom: number | undefined;
  let headerTitle = built.main.name;
  let headerText: string | undefined;
  if (sec.kind === 'line') {
    rep = { ...sec.line.replay, notes: sec.line.notes };
    highlightFrom = sec.line.from || undefined;
    headerTitle = sec.line.id === 'main' ? `Main line: ${sec.line.name}` : sec.line.name;
    headerText = sec.line.summary;
  } else if (sec.kind === 'trap') {
    const t = o.traps[sec.idx];
    const f = fullLine(t.line);
    rep = { ...f.replay, notes: f.moves.map((x) => x.note) };
    headerTitle = `${t.side === 'you' ? 'Trap to set' : 'Trap to avoid'}: ${t.name}`;
    headerText = t.summary;
  } else if (sec.kind === 'mistake') {
    const mk = o.mistakes[sec.idx];
    const f = fullLine(mk.line);
    rep = { ...f.replay, notes: f.moves.map((x) => x.note) };
    headerTitle = `Common mistake: ${mk.title}`;
    headerText = mk.explanation;
  } else if (sec.kind === 'model' && o.modelGame) {
    const f = fullLine(o.modelGame.line);
    rep = { ...f.replay, notes: f.moves.map((x) => x.note) };
    headerTitle = o.modelGame.title;
    headerText = o.modelGame.summary;
  }
  const secKey = sec.kind === 'line' ? sec.line.id : `${sec.kind}-${'idx' in sec ? sec.idx : ''}`;

  return (
    <>
      <button type="button" className="back-link" onClick={() => navigate(`/openings?side=${o.side}`)}>
        <Icon name="arrow-left" size={18} /> Openings
      </button>
      <div className="opening-hero">
        <span className={`side-badge ${o.side}`}>
          <PieceGlyph code={o.side + 'k'} size={36} />
        </span>
        <div className="grow">
          <span className="eyebrow">
            {o.eco} · {o.side === 'w' ? 'You play White' : 'You play Black'} · {o.character}
          </span>
          <h1>{o.name}</h1>
          <p className="muted">{o.tagline}</p>
        </div>
        <ProgressRing value={m.pct} size={62} stroke={6} color="var(--gold)">
          <b>{Math.round(m.pct * 100)}%</b>
        </ProgressRing>
      </div>
      <Tabs
        tabs={[
          { id: 'learn', label: 'Learn', icon: 'book-open' },
          { id: 'drill', label: 'Drill', icon: 'target', badge: m.due },
          { id: 'play', label: 'Play', icon: 'swords' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'learn' && (
        <>
          <div className="card overview-card">
            <RichText text={o.overview.join('\n\n')} />
            <p className="when">
              <Icon name="info" size={16} /> {o.whenToPlay}
            </p>
          </div>
          <div className="goals-grid">
            <div className="card">
              <h3 className="card-title">
                <PieceGlyph code="wk" size={20} /> White’s goals
              </h3>
              <ul className="clean-list">
                {o.goals.white.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="card-title">
                <PieceGlyph code="bk" size={20} /> Black’s goals
              </h3>
              <ul className="clean-list">
                {o.goals.black.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="section-title">Move by move</h2>
          <div className="line-chips">
            <button type="button" className={`chip${sec.kind === 'line' && sec.line.id === 'main' ? ' on' : ''}`} onClick={() => setSection(null)}>
              <Icon name="star" size={14} /> Main line
            </button>
            {built.variations.map((v) => (
              <button key={v.id} type="button" className={`chip${sec.kind === 'line' && sec.line.id === v.id ? ' on' : ''}`} onClick={() => setSection({ kind: 'line', line: v })}>
                {v.name}
              </button>
            ))}
            {o.traps.map((t, i) => (
              <button key={t.id} type="button" className={`chip ${t.side === 'you' ? 'chip-good' : 'chip-bad'}${sec.kind === 'trap' && sec.idx === i ? ' on' : ''}`} onClick={() => setSection({ kind: 'trap', idx: i })}>
                <Icon name={t.side === 'you' ? 'zap' : 'warning'} size={14} /> {t.name}
              </button>
            ))}
            {o.mistakes.map((mk, i) => (
              <button key={mk.title} type="button" className={`chip chip-bad${sec.kind === 'mistake' && sec.idx === i ? ' on' : ''}`} onClick={() => setSection({ kind: 'mistake', idx: i })}>
                <Icon name="x" size={14} /> Mistake
              </button>
            ))}
            {o.modelGame && (
              <button type="button" className={`chip${sec.kind === 'model' ? ' on' : ''}`} onClick={() => setSection({ kind: 'model' })}>
                <Icon name="trophy" size={14} /> Model game
              </button>
            )}
          </div>
          <LineExplorer
            rep={rep}
            orientation={sec.kind === 'trap' && o.traps[sec.idx].side === 'them' ? (o.side === 'w' ? 'b' : 'w') : o.side}
            highlightFrom={highlightFrom}
            autoAdvanceKey={secKey}
            initialPly={highlightFrom ?? 0}
            onPly={(ply) => {
              if (sec.kind === 'line' && sec.line.id === 'main' && markOpeningStudied(o.id, ply, built.main.sans.length)) {
                toast({ icon: 'book', title: `${o.name} learned!`, body: 'Now drill it until the moves are automatic.', tone: 'success' });
              }
            }}
            header={
              <div className="explorer-head">
                <b>{headerTitle}</b>
                {headerText && <p className="muted small">{headerText}</p>}
              </div>
            }
          />
          <h2 className="section-title">Typical plans</h2>
          <div className="card">
            <ul className="clean-list">
              {o.plans.map((pl) => (
                <li key={pl}>{pl}</li>
              ))}
            </ul>
          </div>
          <div className="cta-row">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setTab('drill')}>
              <Icon name="target" size={18} /> Drill this opening
            </button>
            <button type="button" className="btn btn-soft btn-lg" onClick={() => navigate(`/drill/${o.id}?mode=quiz`)}>
              <Icon name="help" size={18} /> Take the idea quiz
            </button>
          </div>
        </>
      )}

      {tab === 'drill' && <DrillTab openingId={o.id} />}
      {tab === 'play' && <PlayTab openingId={o.id} />}
    </>
  );
}

function DrillTab({ openingId }: { openingId: string }) {
  const p = useProgress();
  const o = getOpening(openingId)!;
  const b = buildOpening(o);
  const m = openingMastery(p, o.id, b.cards.map((c) => c.id));
  const opponentDeviations = b.variations.filter((v) => v.from % 2 === (o.side === 'w' ? 1 : 0));
  const modes = [
    { id: 'line', icon: 'target', title: 'Line trainer', desc: 'Play the lines from memory. Spaced repetition brings back each position just before you would forget it.', badge: m.due ? `${m.due} due` : m.seen < m.total ? `${m.total - m.seen} new` : 'All reviewed' },
    { id: 'deviation', icon: 'shuffle', title: 'Deviation drill', desc: 'Your opponent leaves the main line. Find the right reply.', badge: `${opponentDeviations.length} line${opponentDeviations.length === 1 ? '' : 's'}`, disabled: !opponentDeviations.length },
    { id: 'traps', icon: 'zap', title: 'Trap spotting', desc: 'Play through the traps from the attacker’s side so you recognise them in your games.', badge: `${o.traps.length} traps`, disabled: !o.traps.length },
    { id: 'quiz', icon: 'help', title: 'Idea quiz', desc: 'Questions about plans and purposes, with an explanation for every answer.', badge: p.openings[o.id]?.quizBest != null ? `Best ${Math.round((p.openings[o.id]!.quizBest ?? 0) * 100)}%` : `${o.quiz.length} questions` },
    { id: 'speed', icon: 'clock', title: 'Speed round', desc: 'Ten positions in 90 seconds. Streaks earn bonus points.', badge: '90 s' },
    { id: 'memory', icon: 'eye', title: 'Memory round', desc: 'The pieces fade after a few moves. Keep playing from memory.', badge: 'Hard' },
  ];
  return (
    <>
      <div className="mastery-card card">
        <div>
          <b className="big-num">{m.mastered}</b>
          <span className="muted">
            of {m.total} positions mastered
          </span>
        </div>
        <div className="mastery-bar">
          <div className="bar bar-gold">
            <div className="bar-fill" style={{ width: `${m.pct * 100}%` }} />
          </div>
          <span className="small muted">A position is mastered after three correct answers spaced over days.</span>
        </div>
      </div>
      <div className="mode-grid">
        {modes.map((md) => (
          <button key={md.id} type="button" className="mode-card" disabled={md.disabled} onClick={() => navigate(`/drill/${o.id}?mode=${md.id}`)}>
            <span className="mode-icon">
              <Icon name={md.icon} size={22} />
            </span>
            <b>{md.title}</b>
            <small className="muted">{md.desc}</small>
            <span className="pill">{md.badge}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function PlayTab({ openingId }: { openingId: string }) {
  const o = getOpening(openingId)!;
  return (
    <>
      <div className="card">
        <p>
          Play a full game where your opponent follows the <b>{o.name}</b> main line for the first moves, then plays freely. If they leave the book, you are on your own: use the ideas you learned.
        </p>
      </div>
      <div className="bot-grid compact">
        {BOTS.map((bot) => (
          <button
            key={bot.id}
            type="button"
            className="bot-card"
            onClick={() => {
              setPendingGame({ bot: bot.id, color: o.side, time: null, opening: o.id, hints: true, evalBar: false, flags: true });
              navigate('/game');
            }}
          >
            <BotAvatar bot={bot} size={46} />
            <span className="bot-text">
              <b>{bot.name}</b>
              <small className="muted">~{bot.elo} · {bot.title}</small>
            </span>
            <Icon name="chevron-right" size={18} className="muted" />
          </button>
        ))}
      </div>
    </>
  );
}
