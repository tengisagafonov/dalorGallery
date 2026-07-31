import { useEffect, useMemo, useState } from 'react';

type Stats = {
  totals: { views: number; visitors: number; selections: number; previews: number; copies: number };
  days: Array<{ date: string; views: number }>;
  topTemplates: Array<{ title: string; views: number; copies: number }>;
};

const cardStyle = { background: '#fff', border: '1px solid #dcdce4', borderRadius: 12, padding: 20 };

function Metric({ label, value }: { label: string; value: number }) {
  return <div style={cardStyle}><div style={{ color: '#666687', fontSize: 13 }}>{label}</div><strong style={{ display: 'block', fontSize: 30, marginTop: 8 }}>{value}</strong></div>;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/api/analytics/stats')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setStats)
      .catch(() => setError(true));
  }, []);
  const maxViews = useMemo(() => Math.max(1, ...(stats?.days.map(({ views }) => views) ?? [1])), [stats]);

  return (
    <main style={{ padding: '32px 40px', color: '#32324d' }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>Dalor Gallery Statistiken</h1>
      <p style={{ color: '#666687', marginTop: 8 }}>Anonyme Nutzung der letzten 30 Tage</p>
      {error && <p style={{ color: '#d02b20' }}>Statistiken konnten nicht geladen werden.</p>}
      {!stats && !error && <p>Daten werden geladen …</p>}
      {stats && <>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(130px, 1fr))', gap: 16, marginTop: 28 }}>
          <Metric label="Seitenaufrufe" value={stats.totals.views} />
          <Metric label="Besucher" value={stats.totals.visitors} />
          <Metric label="Template-Klicks" value={stats.totals.selections} />
          <Metric label="Prompt-Vorschauen" value={stats.totals.previews} />
          <Metric label="Kopierte Prompts" value={stats.totals.copies} />
        </section>
        <section style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Aufrufe pro Tag</h2>
          <div style={{ height: 230, display: 'flex', alignItems: 'end', gap: 5, paddingTop: 20 }}>
            {stats.days.map((day, index) => <div key={day.date} title={`${day.date}: ${day.views}`} style={{ flex: 1, minWidth: 4, height: `${Math.max(3, day.views / maxViews * 100)}%`, background: '#4945ff', borderRadius: '4px 4px 0 0', opacity: index > 22 ? 1 : .65 }} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8e8ea9', fontSize: 12, marginTop: 8 }}><span>{stats.days[0]?.date}</span><span>{stats.days.at(-1)?.date}</span></div>
        </section>
        <section style={{ ...cardStyle, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Beliebteste Templates</h2>
          {stats.topTemplates.length === 0 ? <p style={{ color: '#666687' }}>Noch keine Template-Klicks vorhanden.</p> :
            stats.topTemplates.map((item, index) => <div key={`${item.title}-${index}`} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 110px 110px', padding: '12px 4px', borderTop: '1px solid #eeeef0' }}><strong>#{index + 1}</strong><span>{item.title}</span><span>{item.views} Klicks</span><span>{item.copies} kopiert</span></div>)}
        </section>
      </>}
    </main>
  );
}
