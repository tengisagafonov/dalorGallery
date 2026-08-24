export default {
  type: 'content-api',
  routes: [
    { method: 'POST', path: '/analytics/track', handler: 'analytics.track' },
    { method: 'GET', path: '/analytics/popular', handler: 'analytics.popular' },
    // `analytics.stats` ist bewusst nicht hier: die Auswertung hängt als Admin-Route
    // unter /dalor-statistics/stats und ist damit nicht öffentlich abrufbar.
    // Siehe src/bootstrap/admin-statistics-route.ts
  ],
};
