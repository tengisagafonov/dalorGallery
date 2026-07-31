import { useEffect, useState } from 'react';

type Totals = {
  views: number;
  visitors: number;
  selections: number;
  previews: number;
  copies: number;
};

export default function StatisticsWidget() {
  const [totals, setTotals] = useState<Totals | null>(null);
  useEffect(() => {
    fetch('/api/analytics/stats')
      .then((response) => response.json())
      .then((data) => setTotals(data.totals))
      .catch(() => setTotals(null));
  }, []);

  if (!totals) return <p style={{ color: '#666687' }}>Statistiken werden geladen …</p>;
  const items = [
    ['Aufrufe', totals.views],
    ['Besucher', totals.visitors],
    ['Template-Klicks', totals.selections],
    ['Vorschauen', totals.previews],
    ['Kopiert', totals.copies],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {items.map(([label, value]) => (
        <div key={label} style={{ border: '1px solid #dcdce4', borderRadius: 8, padding: 12 }}>
          <span style={{ color: '#666687', fontSize: 12 }}>{label}</span>
          <strong style={{ display: 'block', fontSize: 24, marginTop: 4 }}>{value}</strong>
        </div>
      ))}
    </div>
  );
}
