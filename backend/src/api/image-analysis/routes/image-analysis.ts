export default {
  type: 'content-api',
  routes: [{ method: 'POST', path: '/image-analysis', handler: 'image-analysis.analyze' }],
};
