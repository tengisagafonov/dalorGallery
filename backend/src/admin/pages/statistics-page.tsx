import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { useTheme } from 'styled-components';

/** Admin-Route, kein /api-Endpunkt – die Auswertung ist nicht öffentlich. */
const STATS_URL = '/dalor-statistics/stats';

type MetricKey = 'views' | 'visitors' | 'selections' | 'previews' | 'copies';
type DayPoint = { date: string } & Record<MetricKey, number>;
type CountryRow = { code: string; interactions: number; share: number } & Record<MetricKey, number>;

type Stats = {
  range: { days: number; from: string; to: string };
  totals: Record<MetricKey, number>;
  trends: Record<MetricKey, number | null>;
  days: DayPoint[];
  countries: CountryRow[];
  countrySummary: { tracked: number; unknown: number; distinct: number };
  topTemplates: Array<{ title: string; views: number; copies: number; countries: number }>;
};

const METRICS: Array<{ key: MetricKey; label: string; hint: string }> = [
  { key: 'views', label: 'Seitenaufrufe', hint: 'Geladene Galerie-Seiten' },
  { key: 'visitors', label: 'Besucher', hint: 'Eindeutige Geräte' },
  { key: 'selections', label: 'Template-Klicks', hint: 'Geöffnete Templates' },
  { key: 'previews', label: 'Prompt-Vorschauen', hint: 'Aufgedeckte Prompts' },
  { key: 'copies', label: 'Kopierte Prompts', hint: 'In die Zwischenablage' },
];

const RANGES = [
  { days: 7, label: '7 Tage' },
  { days: 30, label: '30 Tage' },
  { days: 90, label: '90 Tage' },
];

const numberFormat = new Intl.NumberFormat('de-DE');

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['de'], { type: 'region' });
  } catch {
    return null;
  }
})();

function countryName(code: string) {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

function formatDay(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.`;
}

function formatFullDay(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long' });
}

/** Rundet die Achsenobergrenze auf einen glatten Wert, damit die Hilfslinien ganzzahlig bleiben. */
function niceMax(value: number) {
  const target = Math.max(1, value) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const factor = [1, 2, 2.5, 5, 10].find((option) => magnitude * option >= target) ?? 10;
  return Math.max(1, Math.round(magnitude * factor)) * 4;
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
        padding: 24,
        boxShadow: '0 1px 4px rgba(33, 33, 52, 0.07)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Trend({ value, palette }: { value: number | null; palette: Palette }) {
  if (value === null) return <span style={{ fontSize: 12, color: palette.faint }}>neu</span>;
  const flat = value === 0;
  const up = value > 0;
  const color = flat ? palette.faint : up ? palette.success : palette.danger;
  const background = flat ? palette.raised : up ? palette.successSoft : palette.dangerSoft;
  return (
    <span
      title="Veränderung gegenüber dem gleich langen Zeitraum davor"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        background,
        color,
        borderRadius: 4,
        padding: '2px 6px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {flat ? '±' : up ? '▲' : '▼'}
      {Math.abs(value)} %
    </span>
  );
}

function MetricCard({
  metric,
  value,
  trend,
  active,
  palette,
  onSelect,
}: {
  metric: (typeof METRICS)[number];
  value: number;
  trend: number | null;
  active: boolean;
  palette: Palette;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${metric.hint} – im Diagramm anzeigen`}
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
        color: palette.text,
        background: palette.surface,
        border: `1px solid ${active ? palette.accent : palette.border}`,
        boxShadow: active ? `inset 0 -3px 0 ${palette.accent}, 0 1px 4px rgba(33, 33, 52, 0.07)` : '0 1px 4px rgba(33, 33, 52, 0.07)',
        borderRadius: 8,
        padding: '18px 20px',
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      <div style={{ fontSize: 12, color: palette.muted, textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>
        {metric.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
        <strong style={{ fontSize: 30, lineHeight: 1.1 }}>{numberFormat.format(value)}</strong>
        <Trend value={trend} palette={palette} />
      </div>
    </button>
  );
}

function Chart({ days, metric, palette }: { days: DayPoint[]; metric: MetricKey; palette: Palette }) {
  const [hover, setHover] = useState<number | null>(null);
  const points = days.map((day) => day[metric]);
  const max = niceMax(Math.max(0, ...points));
  const width = 1000;
  const height = 260;
  const positionOf = (index: number) => (days.length < 2 ? width / 2 : (index / (days.length - 1)) * width);
  const heightOf = (value: number) => height - (value / max) * height;

  const line = points.map((value, index) => `${index === 0 ? 'M' : 'L'} ${positionOf(index).toFixed(2)} ${heightOf(value).toFixed(2)}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(max * fraction));
  const active = hover === null ? null : days[hover];

  return (
    <div style={{ position: 'relative', paddingLeft: 52, marginTop: 20 }}>
      {gridValues.map((value, index) => (
        <div
          key={value}
          style={{
            position: 'absolute',
            left: 0,
            top: `${(1 - index / (gridValues.length - 1)) * height}px`,
            width: 40,
            textAlign: 'right',
            fontSize: 11,
            color: palette.faint,
            transform: 'translateY(-50%)',
          }}
        >
          {numberFormat.format(value)}
        </div>
      ))}

      <div style={{ position: 'relative', height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="dalor-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={palette.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridValues.map((value, index) => (
            <line
              key={value}
              x1="0"
              x2={width}
              y1={(1 - index / (gridValues.length - 1)) * height}
              y2={(1 - index / (gridValues.length - 1)) * height}
              stroke={palette.line}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill="url(#dalor-area)" />
          <path
            d={line}
            fill="none"
            stroke={palette.accent}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {active && (
            <line
              x1={positionOf(hover!)}
              x2={positionOf(hover!)}
              y1="0"
              y2={height}
              stroke={palette.accent}
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {days.length <= 31 &&
          points.map((value, index) => (
            <span
              key={days[index].date}
              style={{
                position: 'absolute',
                left: `${(positionOf(index) / width) * 100}%`,
                top: heightOf(value),
                width: hover === index ? 10 : 6,
                height: hover === index ? 10 : 6,
                marginLeft: hover === index ? -5 : -3,
                marginTop: hover === index ? -5 : -3,
                borderRadius: '50%',
                background: palette.surface,
                border: `2px solid ${palette.accent}`,
                pointerEvents: 'none',
              }}
            />
          ))}

        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {days.map((day, index) => (
            <div
              key={day.date}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(null)}
              style={{ flex: 1, cursor: 'crosshair' }}
            />
          ))}
        </div>

        {active && (
          <div
            style={{
              position: 'absolute',
              left: `${(positionOf(hover!) / width) * 100}%`,
              top: 0,
              transform: `translateX(${hover! > days.length / 2 ? 'calc(-100% - 12px)' : '12px'})`,
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: 6,
              padding: '10px 12px',
              boxShadow: '0 2px 15px rgba(33, 33, 52, 0.18)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 2,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{formatFullDay(active.date)}</div>
            {METRICS.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 18,
                  fontSize: 12,
                  color: item.key === metric ? palette.text : palette.muted,
                  fontWeight: item.key === metric ? 700 : 400,
                }}
              >
                <span>{item.label}</span>
                <span>{numberFormat.format(active[item.key])}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: palette.faint, fontSize: 12, marginTop: 10 }}>
        <span>{days[0] && formatDay(days[0].date)}</span>
        <span>{days.at(-1) && formatDay(days.at(-1)!.date)}</span>
      </div>
    </div>
  );
}

function CountryBadge({ code, palette }: { code: string; palette: Palette }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 34,
        padding: '3px 6px',
        borderRadius: 4,
        background: palette.accentSoft,
        color: palette.accent,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.5px',
      }}
    >
      {code}
    </span>
  );
}

function Countries({ stats, palette }: { stats: Stats; palette: Palette }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? stats.countries : stats.countries.slice(0, 8);
  const max = Math.max(1, ...stats.countries.map((country) => country.interactions));

  return (
    <Card palette={palette}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Herkunft der Klicks</h2>
          <p style={{ margin: '4px 0 0', color: palette.muted, fontSize: 13 }}>
            {stats.countrySummary.distinct === 0
              ? 'Noch keine Herkunft erkannt'
              : `${stats.countrySummary.distinct} ${stats.countrySummary.distinct === 1 ? 'Land' : 'Länder'} · ${numberFormat.format(stats.countrySummary.tracked)} zugeordnete Interaktionen`}
          </p>
        </div>
        {stats.countrySummary.unknown > 0 && (
          <span
            title="Ereignisse ohne erkennbare Herkunft – z. B. Daten von vor der Umstellung"
            style={{ fontSize: 12, color: palette.faint, whiteSpace: 'nowrap' }}
          >
            {numberFormat.format(stats.countrySummary.unknown)} unbekannt
          </span>
        )}
      </div>

      {stats.countries.length === 0 ? (
        <p style={{ color: palette.muted, marginTop: 20, marginBottom: 0 }}>
          Sobald neue Besucher die Galerie öffnen, erscheint hier ihre Herkunft.
        </p>
      ) : (
        <div style={{ marginTop: 20 }}>
          {visible.map((country, index) => (
            <div
              key={country.code}
              style={{
                display: 'grid',
                gridTemplateColumns: '26px 44px minmax(0, 1fr) 90px 74px',
                alignItems: 'center',
                gap: 12,
                padding: '11px 0',
                borderTop: index === 0 ? 'none' : `1px solid ${palette.line}`,
              }}
            >
              <span style={{ color: palette.faint, fontSize: 13, fontWeight: 600 }}>{index + 1}</span>
              <CountryBadge code={country.code} palette={palette} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {countryName(country.code)}
                </div>
                <div style={{ height: 5, borderRadius: 3, background: palette.raised, marginTop: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(2, (country.interactions / max) * 100)}%`,
                      height: '100%',
                      borderRadius: 3,
                      background: palette.accent,
                      opacity: 1 - Math.min(0.55, index * 0.06),
                    }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 13, color: palette.muted, textAlign: 'right' }} title="Eindeutige Besucher">
                {numberFormat.format(country.visitors)} Besucher
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }} title={`${numberFormat.format(country.interactions)} Interaktionen`}>
                {country.share.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %
              </span>
            </div>
          ))}

          {stats.countries.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              style={{
                marginTop: 14,
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                color: palette.accent,
                cursor: 'pointer',
              }}
            >
              {expanded ? 'Weniger anzeigen' : `Alle ${stats.countries.length} Länder anzeigen`}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

function Templates({ stats, palette }: { stats: Stats; palette: Palette }) {
  const max = Math.max(1, ...stats.topTemplates.map((template) => template.views));
  return (
    <Card palette={palette}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Beliebteste Templates</h2>
      <p style={{ margin: '4px 0 0', color: palette.muted, fontSize: 13 }}>Nach Klicks im gewählten Zeitraum</p>
      {stats.topTemplates.length === 0 ? (
        <p style={{ color: palette.muted, marginTop: 20, marginBottom: 0 }}>Noch keine Template-Klicks vorhanden.</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          {stats.topTemplates.map((template, index) => (
            <div
              key={`${template.title}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '26px minmax(0, 1fr) 86px 92px 92px',
                alignItems: 'center',
                gap: 12,
                padding: '11px 0',
                borderTop: index === 0 ? 'none' : `1px solid ${palette.line}`,
              }}
            >
              <span style={{ color: palette.faint, fontSize: 13, fontWeight: 600 }}>{index + 1}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.title}</div>
                <div style={{ height: 5, borderRadius: 3, background: palette.raised, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, (template.views / max) * 100)}%`, height: '100%', borderRadius: 3, background: palette.accent }} />
                </div>
              </div>
              <span style={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{numberFormat.format(template.views)} Klicks</span>
              <span style={{ fontSize: 13, textAlign: 'right', color: palette.muted }}>{numberFormat.format(template.copies)} kopiert</span>
              <span style={{ fontSize: 13, textAlign: 'right', color: palette.muted }} title="Anzahl unterschiedlicher Herkunftsländer">
                {template.countries === 0 ? '–' : `${template.countries} ${template.countries === 1 ? 'Land' : 'Länder'}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function StatisticsPage() {
  const palette = usePalette();
  // useFetchClient hängt das Admin-Token an – ohne das antwortet die Route mit 401.
  const { get } = useFetchClient();
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState<MetricKey>('views');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    get<Stats>(`${STATS_URL}?days=${range}`)
      .then(({ data }) => {
        if (cancelled) return;
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [get, range]);

  const activeMetric = useMemo(() => METRICS.find((item) => item.key === metric)!, [metric]);

  return (
    <main style={{ padding: '40px 56px 64px', color: palette.text, maxWidth: 1320 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0, letterSpacing: '-.4px' }}>Statistiken</h1>
          <p style={{ color: palette.muted, marginTop: 6, marginBottom: 0 }}>
            Anonyme Nutzung der Dalor Gallery
            {stats && ` · ${formatDay(stats.range.from)} – ${formatDay(stats.range.to)}`}
          </p>
        </div>
        <div style={{ display: 'inline-flex', background: palette.raised, border: `1px solid ${palette.border}`, borderRadius: 6, padding: 3 }}>
          {RANGES.map((option) => (
            <button
              key={option.days}
              type="button"
              onClick={() => setRange(option.days)}
              style={{
                font: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: 4,
                border: 'none',
                background: range === option.days ? palette.surface : 'transparent',
                color: range === option.days ? palette.accent : palette.muted,
                boxShadow: range === option.days ? '0 1px 3px rgba(33, 33, 52, 0.12)' : 'none',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <Card palette={palette} style={{ marginTop: 28, borderColor: palette.danger }}>
          <strong style={{ color: palette.danger }}>Statistiken konnten nicht geladen werden.</strong>
          <p style={{ color: palette.muted, margin: '6px 0 0', fontSize: 13 }}>
            Läuft der Strapi-Server? Der Endpunkt <code>/api/analytics/stats</code> hat nicht geantwortet.
          </p>
        </Card>
      )}

      {loading && !error && <p style={{ color: palette.muted, marginTop: 28 }}>Daten werden geladen …</p>}

      {stats && !error && (
        <div style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .15s' }}>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 16,
              marginTop: 28,
            }}
          >
            {METRICS.map((item) => (
              <MetricCard
                key={item.key}
                metric={item}
                value={stats.totals[item.key]}
                trend={stats.trends[item.key]}
                active={metric === item.key}
                palette={palette}
                onSelect={() => setMetric(item.key)}
              />
            ))}
          </section>

          <Card palette={palette} style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>{activeMetric.label} pro Tag</h2>
                <p style={{ margin: '4px 0 0', color: palette.muted, fontSize: 13 }}>{activeMetric.hint}</p>
              </div>
              <span style={{ fontSize: 12, color: palette.faint }}>Kennzahl oben auswählen</span>
            </div>
            <Chart days={stats.days} metric={metric} palette={palette} />
          </Card>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20, marginTop: 20 }}>
            <Countries stats={stats} palette={palette} />
            <Templates stats={stats} palette={palette} />
          </section>
        </div>
      )}
    </main>
  );
}
