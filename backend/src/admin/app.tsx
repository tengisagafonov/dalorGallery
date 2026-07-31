import type { ReactNode } from 'react';

function ChartIcon(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export default {
  config: {
    locales: ['de'],
  },
  register(app: any) {
    app.addMenuLink({
      to: 'plugins/dalor-statistics',
      icon: ChartIcon,
      intlLabel: { id: 'dalor.statistics', defaultMessage: 'Statistiken' },
      Component: () => import('./pages/statistics-page'),
      permissions: [],
    });
    app.widgets.register({
      id: 'dalor-statistics',
      pluginId: 'dalor-gallery',
      icon: ChartIcon,
      title: { id: 'dalor.statistics.widget', defaultMessage: 'Dalor Statistiken' },
      component: async () => (await import('./pages/statistics-widget')).default,
    });
  },
};
