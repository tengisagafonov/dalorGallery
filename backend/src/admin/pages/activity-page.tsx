import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { useTheme } from 'styled-components';

/** Admin-Route, kein /api-Endpunkt – das Protokoll ist nicht öffentlich. */
const ACTIVITY_URL = '/dalor-statistics/activity';
const REFRESH_MS = 15_000;

type Level = 'info' | 'warning' | 'error';
type Category = 'content' | 'ai' | 'security' | 'system';

type Entry = {
  id: number;
  createdAt: string;
  level: Level;
  category: Category;
  action: string;
  message: string;
  actor: string | null;
  context: Record<string, unknown> | null;
  durationMs: number | null;
};

type Response = {
  entries: Entry[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
  lastDay: { errors: number; warnings: number; aiCalls: number; contentChanges: number };
};

const CATEGORY_LABELS: Record<Category, string> = {
  content: 'Inhalt',
  ai: 'KI',
  security: 'Sicherheit',
  system: 'System',
};

const LEVEL_LABELS: Record<Level, string> = {
  info: 'Info',
  warning: 'Warnung',
  error: 'Fehler',
};

const numberFormat = new Intl.NumberFormat('de-DE');
const timeFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' });

/** „vor 3 Minuten" ist beim Draufschauen nützlicher als ein Zeitstempel. */
function relativeTime(value: string) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'gerade eben';
  if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`;
  if (seconds < 86_400) return `vor ${Math.floor(seconds / 3600)} Std.`;
  return `vor ${Math.floor(seconds / 86_400)} Tg.`;
}

function usePalette() {
  const colors = useTheme()?.colors;
  return {
    surface: colors?.neutral0 ?? '#ffffff',
    raised: colors?.neutral100 ?? '#f6f6f9',
    border: colors?.neutral200 ?? '#eaeaef',
    line: colors?.neutral150 ?? '#eaeaef',
    text: colors?.neutral800 ?? '#32324d',
    muted: colors?.neutral600 ?? '#666687',
    faint: colors?.neutral500 ?? '#8e8ea9',
    accent: colors?.primary600 ?? '#4945ff',
    accentSoft: colors?.primary100 ?? '#f0f0ff',
    success: colors?.success600 ?? '#328048',
    successSoft: colors?.success100 ?? '#eafbe7',
    warning: colors?.warning600 ?? '#be5d01',
    warningSoft: colors?.warning100 ?? '#fdf4dc',
    danger: colors?.danger600 ?? '#d02b20',
    dangerSoft: colors?.danger100 ?? '#fcecea',
  };
}

type Palette = ReturnType<typeof usePalette>;

function Card({ palette, style, children }: { palette: Palette; style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(33, 33, 52, 0.07)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ text, color, background }: { text: string; color: string; background: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background,
        color,
        borderRadius: 4,
        padding: '2px 7px',
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function LevelBadge({ level, palette }: { level: Level; palette: Palette }) {
  const map = {
    info: [palette.muted, palette.raised],
    warning: [palette.warning, palette.warningSoft],
    error: [palette.danger, palette.dangerSoft],
  } as const;
  const [color, background] = map[level] ?? map.info;
  return <Badge text={LEVEL_LABELS[level] ?? level} color={color} background={background} />;
}

function Stat({ label, value, tone, palette }: { label: string; value: number; tone: string; palette: Palette }) {
  return (
    <Card palette={palette} style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 12, color: palette.muted, textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>
        {label}
      </div>
      <strong style={{ display: 'block', fontSize: 26, marginTop: 8, color: tone }}>
        {numberFormat.format(value)}
      </strong>
    </Card>
  );
}

function FilterGroup<T extends string>({
  options,
  value,
  onChange,
  palette,
}: {
  options: Array<{ value: T | ''; label: string }>;
  value: T | '';
  onChange: (next: T | '') => void;
  palette: Palette;
}) {
  return (
    <div style={{ display: 'inline-flex', background: palette.raised, border: `1px solid ${palette.border}`, borderRadius: 6, padding: 3 }}>
      {options.map((option) => (
        <button
          key={option.value || 'all'}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            font: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 4,
            border: 'none',
            background: value === option.value ? palette.surface : 'transparent',
            color: value === option.value ? palette.accent : palette.muted,
            boxShadow: value === option.value ? '0 1px 3px rgba(33, 33, 52, 0.12)' : 'none',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Row({ entry, palette }: { entry: Entry; palette: Palette }) {
  const [open, setOpen] = useState(false);
  const created = new Date(entry.createdAt);
  const hasDetails = Boolean(entry.context && Object.keys(entry.context).length > 0);

  return (
    <div style={{ borderTop: `1px solid ${palette.line}` }}>
      <div
        onClick={() => hasDetails && setOpen((value) => !value)}
        style={{
          display: 'grid',
          gridTemplateColumns: '104px 78px 92px minmax(0, 1fr) 150px 74px',
          alignItems: 'center',
          gap: 12,
          padding: '11px 20px',
          cursor: hasDetails ? 'pointer' : 'default',
        }}
      >
        <span style={{ fontSize: 12, color: palette.faint }} title={`${dateFormat.format(created)} ${timeFormat.format(created)}`}>
          {relativeTime(entry.createdAt)}
        </span>
        <LevelBadge level={entry.level} palette={palette} />
        <Badge text={CATEGORY_LABELS[entry.category] ?? entry.category} color={palette.accent} background={palette.accentSoft} />
        <span style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={entry.message}>
          {hasDetails && <span style={{ color: palette.faint, marginRight: 6 }}>{open ? '▾' : '▸'}</span>}
          {entry.message}
        </span>
        <span style={{ fontSize: 12, color: palette.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.actor ?? '—'}
        </span>
        <span style={{ fontSize: 12, color: palette.faint, textAlign: 'right' }}>
          {entry.durationMs === null ? '' : `${numberFormat.format(entry.durationMs)} ms`}
        </span>
      </div>
      {open && hasDetails && (
        <pre
          style={{
            margin: 0,
            padding: '10px 20px 16px 116px',
            fontSize: 12,
            lineHeight: 1.6,
            color: palette.muted,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {`${entry.action}\n${JSON.stringify(entry.context, null, 2)}`}
        </pre>
      )}
    </div>
  );
}

export default function ActivityPage() {
  const palette = usePalette();
  const { get } = useFetchClient();
  const [level, setLevel] = useState<Level | ''>('');
  const [category, setCategory] = useState<Category | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(search);
  searchRef.current = search;

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const params = new URLSearchParams({ page: String(page), pageSize: '50' });
      if (level) params.set('level', level);
      if (category) params.set('category', category);
      if (searchRef.current.trim()) params.set('search', searchRef.current.trim());
      try {
        const { data: payload } = await get<Response>(`${ACTIVITY_URL}?${params}`);
        setData(payload);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [category, get, level, page],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Nachladen nur, wenn der Tab sichtbar ist – sonst läuft im Hintergrund
  // unnötig eine Abfrage pro Viertelminute.
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) void load(true);
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [autoRefresh, load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      void load();
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const pagination = data?.pagination;

  return (
    <main style={{ padding: '40px 56px 64px', color: palette.text, maxWidth: 1320 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0, letterSpacing: '-.4px' }}>Aktivität</h1>
          <p style={{ color: palette.muted, marginTop: 6, marginBottom: 0 }}>
            Was im System passiert – Inhalte, KI-Aufrufe, abgewiesene Anfragen und Fehler
          </p>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: palette.muted, cursor: 'pointer' }}>
          <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
          Alle 15 Sekunden aktualisieren
        </label>
      </header>

      {error && (
        <Card palette={palette} style={{ marginTop: 28, padding: 24, borderColor: palette.danger }}>
          <strong style={{ color: palette.danger }}>Protokoll konnte nicht geladen werden.</strong>
          <p style={{ color: palette.muted, margin: '6px 0 0', fontSize: 13 }}>
            Läuft der Strapi-Server? Der Endpunkt <code>{ACTIVITY_URL}</code> hat nicht geantwortet.
          </p>
        </Card>
      )}

      {data && !error && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginTop: 28 }}>
            <Stat label="Fehler (24 Std.)" value={data.lastDay.errors} tone={data.lastDay.errors ? palette.danger : palette.text} palette={palette} />
            <Stat label="Warnungen (24 Std.)" value={data.lastDay.warnings} tone={data.lastDay.warnings ? palette.warning : palette.text} palette={palette} />
            <Stat label="KI-Aufrufe (24 Std.)" value={data.lastDay.aiCalls} tone={palette.text} palette={palette} />
            <Stat label="Inhaltsänderungen (24 Std.)" value={data.lastDay.contentChanges} tone={palette.text} palette={palette} />
          </section>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <FilterGroup
              palette={palette}
              value={level}
              onChange={(next) => { setLevel(next); setPage(1); }}
              options={[
                { value: '', label: 'Alle Stufen' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warnung' },
                { value: 'error', label: 'Fehler' },
              ]}
            />
            <FilterGroup
              palette={palette}
              value={category}
              onChange={(next) => { setCategory(next); setPage(1); }}
              options={[
                { value: '', label: 'Alle Bereiche' },
                { value: 'content', label: 'Inhalt' },
                { value: 'ai', label: 'KI' },
                { value: 'security', label: 'Sicherheit' },
                { value: 'system', label: 'System' },
              ]}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Suchen …"
              style={{
                flex: 1,
                minWidth: 180,
                font: 'inherit',
                fontSize: 13,
                padding: '8px 12px',
                borderRadius: 6,
                border: `1px solid ${palette.border}`,
                background: palette.surface,
                color: palette.text,
              }}
            />
          </div>

          <Card palette={palette} style={{ marginTop: 16, opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '104px 78px 92px minmax(0, 1fr) 150px 74px',
                gap: 12,
                padding: '13px 20px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.4px',
                textTransform: 'uppercase',
                color: palette.faint,
              }}
            >
              <span>Wann</span>
              <span>Stufe</span>
              <span>Bereich</span>
              <span>Vorgang</span>
              <span>Wer</span>
              <span style={{ textAlign: 'right' }}>Dauer</span>
            </div>

            {data.entries.length === 0 ? (
              <p style={{ color: palette.muted, padding: '28px 20px', margin: 0, borderTop: `1px solid ${palette.line}` }}>
                Keine Einträge für diese Auswahl.
              </p>
            ) : (
              data.entries.map((entry) => <Row key={entry.id} entry={entry} palette={palette} />)
            )}
          </Card>

          {pagination && pagination.pageCount > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <span style={{ fontSize: 13, color: palette.muted }}>
                Seite {pagination.page} von {pagination.pageCount} · {numberFormat.format(pagination.total)} Einträge
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Zurück', target: pagination.page - 1, disabled: pagination.page <= 1 },
                  { label: 'Weiter', target: pagination.page + 1, disabled: pagination.page >= pagination.pageCount },
                ].map((button) => (
                  <button
                    key={button.label}
                    type="button"
                    disabled={button.disabled}
                    onClick={() => setPage(button.target)}
                    style={{
                      font: 'inherit',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: `1px solid ${palette.border}`,
                      background: palette.surface,
                      color: button.disabled ? palette.faint : palette.accent,
                      cursor: button.disabled ? 'not-allowed' : 'pointer',
                      opacity: button.disabled ? 0.55 : 1,
                    }}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {loading && !data && !error && <p style={{ color: palette.muted, marginTop: 28 }}>Protokoll wird geladen …</p>}
    </main>
  );
}
