export default {
  type: 'content-api',
  routes: [
    // Einzelabruf eines Prompts. Bewusst eine eigene Route, damit `find`/`findOne`
    // den Prompt gar nicht erst mitliefern müssen.
    { method: 'GET', path: '/templates/:id/prompt', handler: 'template.prompt' },
  ],
};
