import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { useTheme } from 'styled-components';

/** Admin-Route, kein /api-Endpunkt – die Auswertung ist nicht öffentlich. */
const STATS_URL = '/dalor-statistics/stats';

type MetricKey = 'views' | 'visitors' | 'selections' | 'copies';
type CountryRow = { code: string; visitors: number; share: number };
type Stats = {
  totals: Record<MetricKey, number>;
  trends: Record<MetricKey, number | null>;
  countries: CountryRow[];
  countrySummary: { distinct: number };
};

const METRICS: Array<{ key: MetricKey; label: string }> = [
  { key: 'views', label: 'Aufrufe' },
  { key: 'visitors', label: 'Besucher' },
  { key: 'selections', label: 'Template-Klicks' },
  { key: 'copies', label: 'Kopiert' },
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

export default function StatisticsWidget() {
  // useFetchClient hängt das Admin-Token an – ohne das antwortet die Route mit 401.
  const { get } = useFetchClient();
  const colors = useTheme()?.colors;
  const palette = {
    border: colors?.neutral200 ?? '#eaeaef',
    muted: colors?.neutral600 ?? '#666687',
    faint: colors?.neutral500 ?? '#8e8ea9',
    accent: colors?.primary600 ?? '#4945ff',
    accentSoft: colors?.primary100 ?? '#f0f0ff',
    success: colors?.success600 ?? '#328048',
    danger: colors?.danger600 ?? '#d02b20',
  };

  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    get<Stats>(`${STATS_URL}?days=30`)
      .then(({ data }) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [get]);

  if (error) return <p style={{ color: palette.danger, margin: 0 }}>Statistiken nicht verfügbar.</p>;
  if (!stats) return <p style={{ color: palette.muted, margin: 0 }}>Statistiken werden geladen …</p>;

  const topCountries = stats.countries.slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {METRICS.map(({ key, label }) => {
          const trend = stats.trends?.[key] ?? null;
          return (
            <div key={key} style={{ border: `1px solid ${palette.border}`, borderRadius: 6, padding: '8px 10px' }}>
              <span style={{ color: palette.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <strong style={{ fontSize: 20, lineHeight: 1.2 }}>{numberFormat.format(stats.totals[key])}</strong>
                {trend !== null && trend !== 0 && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: trend > 0 ? palette.success : palette.danger }}>
                    {trend > 0 ? '▲' : '▼'}
                    {Math.abs(trend)} %
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ color: palette.muted, fontWeight: 600 }}>Top-Herkunft</span>
        {topCountries.length === 0 ? (
          <span style={{ color: palette.faint }}>noch keine Daten</span>
        ) : (
          <>
            {topCountries.map((country) => (
              <span key={country.code} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} title={countryName(country.code)}>
                <span
                  style={{
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: palette.accentSoft,
                    color: palette.accent,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {country.code}
                </span>
                <span style={{ color: palette.muted }}>
                  {country.share.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %
                </span>
              </span>
            ))}
            {stats.countrySummary.distinct > topCountries.length && (
              <span style={{ color: palette.faint }}>+{stats.countrySummary.distinct - topCountries.length} weitere</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
