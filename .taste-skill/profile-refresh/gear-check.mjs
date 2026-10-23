import assert from 'node:assert/strict';
import { Browser, sleep } from 'file:///C:/Users/Silentboiz/.codex/plugins/cache/claude-sync/taste-skill/2.1.4/skills/taste-skill/scripts/lib/cdp.mjs';
const b = await Browser.launch();
async function waitFor(p, condition) {
  for (let i = 0; i < 60; i++) { if (await p.eval(condition)) return; await sleep(150); }
  throw new Error('Timed out: ' + condition);
}
const fixtures = [
  { id: 'old', name: 'Old keyboard', brand: 'Acme', category: 'Keyboard', status: 'retired', notes: 'Used before.' },
  { id: 'current', name: 'Daily keyboard', brand: 'Acme', category: 'Keyboard', status: 'active', notes: 'Current daily driver.' },
  { id: 'audio', name: 'Small DAC', brand: 'Sound', category: 'DAC', status: 'active' },
  { id: 'unknown', name: 'Other item', brand: null, category: null, status: null },
];
async function mock(mode = 'normal') {
  const p = await b.newPage({ width: 390, height: 844, mobile: true });
  let current = mode;
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*://127.0.0.1:3100/api/gears', requestStage: 'Request' }] });
  b.on(p.sessionId, 'Fetch.requestPaused', async event => {
    await p.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: current === 'failed' ? 503 : 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(current === 'empty' ? [] : current === 'invalid' ? [null] : fixtures)).toString('base64') });
  });
  await p.goto('http://127.0.0.1:3100/gears', { settleMs: 1300 });
  return { p, recover: () => current = 'normal' };
}
try {
  const home = await b.newPage({ width: 1920, height: 911 });
  await home.goto('http://127.0.0.1:3100', { settleMs: 1800 });
  await waitFor(home, `document.querySelectorAll('#gears article').length === 6`);
  for (const [width, height] of [[1920, 911], [1440, 900], [1440, 1200], [390, 844]]) {
    await home.setViewport({ width, height });
    await home.eval(() => document.querySelector('nav a[href="#gears"]').click());
    await sleep(1300);
    const top = await home.eval(() => document.querySelector('footer').getBoundingClientRect().top);
    assert.ok(top >= height - 2, `contact stays below gear viewport at ${width}x${height}: ${top}`);
  }
  await home.setViewport({ width: 1440, height: 900 });
  for (const [position, expected] of [['top', 0], ['middle', 50], ['bottom', 100]]) {
    await home.eval(pos => window.scrollTo({ top: pos === 'top' ? 0 : (document.documentElement.scrollHeight - innerHeight) * (pos === 'middle' ? .5 : 1), behavior: 'instant' }), position);
    await sleep(350);
    const value = await home.eval(() => Number(document.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')));
    assert.ok(Math.abs(value - expected) <= 1, `progress ${position}: ${value}`);
  }
  console.log('PASS: six active previews; contact stays below gear section; progress 0/50/100%');
  const { p } = await mock();
  await waitFor(p, `document.querySelectorAll('#collection article').length === 4`);
  assert.deepEqual(await p.eval(() => [...document.querySelectorAll('#collection article h4')].map(e => e.textContent)), ['Daily keyboard', 'Old keyboard', 'Small DAC', 'Other item']);
  assert.ok(await p.eval(() => document.querySelector('#collection').textContent.includes('Chưa cập nhật')));
  assert.equal(await p.eval(() => document.querySelector('nav a[href="/#projects"]') !== null), true);
  await p.eval(() => [...document.querySelectorAll('[aria-label="Lọc theo loại thiết bị"] button')].find(e => e.textContent.startsWith('Bàn phím')).click());
  assert.equal(await p.eval(() => document.querySelectorAll('#collection article').length), 2);
  await p.eval(() => { const input = document.querySelector('#gear-search'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ' acme '); input.dispatchEvent(new Event('input', { bubbles: true })); });
  await sleep(150);
  assert.equal(await p.eval(() => document.querySelectorAll('#collection article').length), 2);
  await p.eval(() => { const input = document.querySelector('#gear-search'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'no match'); input.dispatchEvent(new Event('input', { bubbles: true })); });
  await waitFor(p, `document.querySelector('#collection').textContent.includes('Không tìm thấy thiết bị phù hợp')`);
  await p.eval(() => [...document.querySelectorAll('button')].find(e => e.textContent === 'Xóa bộ lọc').click());
  await waitFor(p, `document.querySelectorAll('#collection article').length === 4`);
  console.log('PASS: category filter, trimmed brand search, combined filters, empty search/reset, active-first order and unknown status');
  const broken = await mock('failed');
  await waitFor(broken.p, `document.querySelector('[role="alert"]') !== null`);
  broken.recover();
  await broken.p.eval(() => [...document.querySelectorAll('button')].find(e => e.textContent === 'Thử lại').click());
  await waitFor(broken.p, `document.querySelectorAll('#collection article').length === 4`);
  const empty = await mock('empty');
  await waitFor(empty.p, `document.querySelector('#collection').textContent.includes('Góc thiết bị đang được cập nhật')`);
  const invalid = await mock('invalid');
  await waitFor(invalid.p, `document.querySelector('[role="alert"]') !== null`);
  console.log('PASS: API failure/retry, true empty collection and malformed data');
  const live = await b.newPage();
  await live.goto('http://127.0.0.1:3100/gears', { settleMs: 1700 });
  await waitFor(live, `document.querySelectorAll('#collection article').length > 0`);
  for (const width of [1440, 768, 390, 320]) {
    await live.setViewport({ width, height: 900 });
    assert.equal(await live.eval(() => document.documentElement.scrollWidth <= innerWidth), true, 'catalogue fits ' + width);
    for (const theme of ['light', 'dark']) {
      await live.eval(t => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
      await sleep(400);
      await live.screenshot({ path: `.taste-skill/profile-refresh/gears-${width}-${theme}.jpg` });
    }
  }
  for (const page of [home, p, broken.p, empty.p, invalid.p, live]) assert.deepEqual(page.consoleErrors, []);
  console.log('PASS: catalogue live data, shared navigation, light/dark and 320–1440px fit; no uncaught browser errors');
} finally { await b.close(); }
