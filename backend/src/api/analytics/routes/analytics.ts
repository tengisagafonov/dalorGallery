export default {
  type: 'content-api',
  routes: [
    { method: 'POST', path: '/analytics/track', handler: 'analytics.track' },
    { method: 'GET', path: '/analytics/popular', handler: 'analytics.popular' },
    { method: 'GET', path: '/analytics/stats', handler: 'analytics.stats' },
  ],
};
