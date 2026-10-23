import { Page, sleep } from 'file:///C:/Users/Silentboiz/.codex/plugins/cache/claude-sync/taste-skill/2.1.4/skills/taste-skill/scripts/lib/cdp.mjs';
const goto = Page.prototype.goto;
Page.prototype.goto = async function(url, options) {
  await this.send('Fetch.enable', { patterns: [{ urlPattern: '*://127.0.0.1:3100/api/*', requestStage: 'Request' }] });
  this.browser.on(this.sessionId, 'Fetch.requestPaused', async event => {
    if (event.request.method !== 'GET') {
      await this.send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' });
    } else if (new URL(event.request.url).pathname === '/api/auth') {
      await this.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200, body: 'e30=' });
    } else await this.send('Fetch.continueRequest', { requestId: event.requestId });
  });
  const result = await goto.call(this, url, options);
  for (let i=0;i<80;i++) {
    if (await this.eval(() => !!document.querySelector('main nav'))) break;
    await sleep(100);
  }
  await this.eval(() => [...document.querySelectorAll('nav button')].find(e => e.textContent.trim() === 'Dự án')?.click());
  await sleep(700);
  return result;
};
process.argv = [process.argv[0], '', 'http://127.0.0.1:3100/admin', '--app', '--out', '.taste-skill/admin/inspection', '--allow', 'font-not-dealt'];
await import('file:///C:/Users/Silentboiz/.codex/plugins/cache/claude-sync/taste-skill/2.1.4/skills/taste-skill/scripts/inspect.mjs');
