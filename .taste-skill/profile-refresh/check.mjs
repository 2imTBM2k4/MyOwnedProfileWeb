import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { Browser, sleep } = await import(pathToFileURL(process.argv[2]).href);
const base = 'http://127.0.0.1:3100';
const out = '.taste-skill/profile-refresh/checks';
mkdirSync(out, { recursive: true });
const browser = await Browser.launch();
const results = [];
const pass = name => { results.push(name); console.log('PASS:', name); };
const fixtures = {
  profile: { username: 'silentboiz', avatar_url: null },
  projects: [{ id: 'p1', title: 'Real project', description: 'A real backend project.', tags: ['featured', 'Node.js'], status: 'active', demo_url: 'example.com/demo', github_url: 'https://github.com/example/project', image_url: null, created_at: '2026-10-21' }],
  gears: [{ id: 'g1', name: 'Current keyboard', category: 'Keyboard', status: 'active', image_url: null, notes: 'My own experience.' }, { id: 'g2', name: 'Retired mouse', category: 'Mouse', status: 'retired' }],
  'social-links': [{ id: 's1', platform: 'Github', url: 'https://github.com/example', display_name: 'example' }],
};

async function waitFor(page, expression) {
  for (let i = 0; i < 60; i++) { if (await page.eval(expression)) return; await sleep(150); }
  throw new Error('Timed out: ' + expression);
}
async function mockedPage(mode = 'normal', cached) {
  const page = await browser.newPage({ width: 390, height: 844, mobile: true });
  let current = mode;
  await page.send('Fetch.enable', { patterns: [{ urlPattern: '*://127.0.0.1:3100/api/*', requestStage: 'Request' }] });
  browser.on(page.sessionId, 'Fetch.requestPaused', async event => {
    const name = new URL(event.request.url).pathname.split('/').pop();
    const body = current === 'failed' ? { error: 'unavailable' } : current === 'empty' ? name === 'profile' ? null : [] : current === 'malformed' ? { error: 'wrong shape' } : current === 'invalid-items' ? name === 'profile' ? null : [null] : fixtures[name];
    await page.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: current === 'failed' ? 503 : 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(body)).toString('base64') });
  });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `sessionStorage.clear(); ${cached ? `sessionStorage.setItem('site_data_cache', ${JSON.stringify(JSON.stringify({ ts: Date.now(), data: cached }))});` : ''}` });
  await page.goto(base, { settleMs: 1200 });
  return { page, recover: () => { current = 'normal'; } };
}
try {
  const live = await browser.newPage();
  await live.goto(base, { settleMs: 2200 });
  await waitFor(live, `document.querySelectorAll('#projects article').length > 0`);
  assert.equal(await live.eval(() => document.querySelectorAll('h1').length), 1);
  assert.equal(await live.eval(() => [...document.querySelectorAll('a')].some(a => /\/games|\/steam|\/hoyolab/.test(a.getAttribute('href')))), false);
  pass('live data renders; one page title; no game/Steam/HoYoLab links');
  for (const width of [1440, 768, 390, 320]) {
    await live.setViewport({ width, height: width === 1440 ? 900 : 844 });
    await live.eval(() => document.querySelector('#gears').scrollIntoView());
    await sleep(1200);
    await live.eval(async () => { await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
    await live.eval(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(300);
    assert.equal(await live.eval(() => document.documentElement.scrollWidth <= innerWidth), true, 'overflow at ' + width);
    for (const theme of ['light', 'dark']) {
      await live.eval(t => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
      await live.screenshot({ path: `${out}/${width}-${theme}.jpg`, fullPage: true });
    }
  }
  pass('1440/768/390/320 widths: no horizontal overflow; screenshots in light and dark');
  const { page } = await mockedPage();
  await waitFor(page, `document.querySelector('#projects')?.textContent.includes('Real project')`);
  assert.equal(await page.eval(() => document.querySelector('#gears').textContent.includes('Retired mouse')), false);
  assert.equal(await page.eval(() => document.querySelector('a[aria-label^="Xem Real project"]').href), 'https://example.com/demo');
  pass('active gear only; bare domain normalized to HTTPS; project links usable');
  for (const id of ['projects', 'about', 'gears', 'contact']) {
    await page.eval(id => document.querySelector(`nav a[href="#${id}"]`).click(), id);
    await sleep(700);
    assert.equal(await page.eval(() => location.hash), '#' + id);
    assert.equal(await page.eval(id => Math.abs(document.getElementById(id).getBoundingClientRect().top) < innerHeight, id), true);
  }
  pass('all four navigation links reach their sections on mobile');
  await page.eval(() => { const button = document.querySelector('header button'); button.click(); });
  const saved = await page.eval(() => localStorage.getItem('theme'));
  assert.equal(await page.eval(() => document.documentElement.classList.contains('dark')), saved === 'dark');
  pass('theme toggle updates page and saved preference');
  await page.eval(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async text => { window.__copied = text; } }); document.querySelector('button[aria-label="Sao chép địa chỉ email"]').click(); });
  await waitFor(page, `document.querySelector('button[aria-label="Sao chép địa chỉ email"]').textContent.includes('Đã sao chép')`);
  assert.equal(await page.eval(() => window.__copied), 'binhminh.tran.dev@gmail.com');
  await page.eval(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('denied'); } }); document.querySelector('button[aria-label="Sao chép địa chỉ email"]').click(); });
  await waitFor(page, `document.querySelector('#contact').textContent.includes('Chưa sao chép được')`);
  pass('clipboard success and denial both give accurate feedback');
  const { page: empty } = await mockedPage('empty');
  await waitFor(empty, `document.querySelector('#projects').textContent.includes('Mình đang cập nhật dự án')`);
  assert.equal(await empty.eval(() => document.querySelectorAll('#projects article, #gears article').length), 0);
  pass('empty database renders honest empty states without fabricated content');
  const broken = await mockedPage('failed');
  await waitFor(broken.page, `document.body.textContent.includes('Một phần dữ liệu chưa tải được')`);
  assert.equal(await broken.page.eval(() => document.querySelector('#projects').textContent.includes('Chưa thể tải')), true);
  broken.recover();
  await broken.page.eval(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'Thử lại').click());
  await waitFor(broken.page, `document.querySelector('#projects').textContent.includes('Real project')`);
  pass('API failures differ from empty data; retry recovers');
  const { page: malformed } = await mockedPage('malformed');
  await waitFor(malformed, `document.body.textContent.includes('Một phần dữ liệu chưa tải được')`);
  assert.equal(malformed.consoleErrors.length, 0);
  pass('malformed endpoint response reports failure without crashing');
  const { page: invalid } = await mockedPage('invalid-items');
  await waitFor(invalid, `document.body.textContent.includes('Một phần dữ liệu chưa tải được')`);
  assert.equal(invalid.consoleErrors.length, 0);
  const { page: badCache } = await mockedPage('normal', { profile: null, projects: [null], gears: [], socialLinks: [] });
  await waitFor(badCache, `document.querySelector('#projects').textContent.includes('Real project')`);
  assert.equal(badCache.consoleErrors.length, 0);
  pass('invalid array items rejected; invalid session cache ignored and replaced by fresh data');
  const { page: cached } = await mockedPage('failed', { profile: fixtures.profile, projects: fixtures.projects, gears: fixtures.gears, socialLinks: fixtures['social-links'] });
  await waitFor(cached, `document.body.textContent.includes('Một phần dữ liệu chưa tải được')`);
  assert.equal(await cached.eval(() => document.querySelector('#projects').textContent.includes('Real project')), true);
  pass('failed refresh preserves cached projects');
  const reduced = await browser.newPage({ width: 390, height: 844, reducedMotion: true });
  await reduced.goto(base, { settleMs: 1700 });
  assert.equal(await reduced.eval(() => document.querySelector('h1').getAnimations().length), 0);
  assert.equal(await reduced.eval(() => getComputedStyle(document.querySelector('h1')).opacity), '1');
  assert.equal(await reduced.eval(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  pass('reduced motion: title visible without entrance animation');
  const keyboard = await browser.newPage();
  await keyboard.goto(base);
  await keyboard.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await keyboard.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  assert.equal(await keyboard.eval(() => document.activeElement?.getAttribute('href')), '#main');
  pass('keyboard navigation starts with visible skip-to-content link');
  const pages = [live, page, empty, broken.page, malformed, invalid, badCache, cached, reduced, keyboard];
  for (const p of pages) assert.deepEqual(p.consoleErrors, [], 'uncaught browser errors');
  console.log(`DONE: ${results.length} browser checks passed`);
} finally { await browser.close(); }
