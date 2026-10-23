import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { Browser, sleep } from 'file:///C:/Users/Silentboiz/.codex/plugins/cache/claude-sync/taste-skill/2.1.4/skills/taste-skill/scripts/lib/cdp.mjs';
const browser = await Browser.launch();
const writes = [];
const fixtures = {
  profile: { username: 'silentboiz', bio: 'Lập trình, bàn phím và những trải nghiệm mỗi ngày.', avatar_url: '', cover_url: '' },
  gears: [{ id: 'keyboard', name: 'WAVE75', brand: 'PMO', category: 'keyboard', status: 'active', image_url: '' }],
  projects: [{ id: 'profile', title: 'Trang cá nhân', description: 'Góc nhỏ cho dự án và thiết bị.', github_url: 'https://github.com/silentboiz', demo_url: '', image_url: '', status: 'active', tags: ['Next.js'], created_at: '2026-10-23' }],
  games: [{ id: 'game', title: 'Trò chơi đã lưu', status: 'offline', publisher: 'Steam' }],
  'social-links': [{ id: 'github', platform: 'github', url: 'https://github.com/silentboiz', display_name: 'silentboiz', display_order: 0 }],
};
async function setup(authenticated) {
  const page = await browser.newPage({ width: 1440, height: 900 });
  let auth = authenticated;
  await page.send('Fetch.enable', { patterns: [{ urlPattern: '*://127.0.0.1:3100/api/*', requestStage: 'Request' }] });
  browser.on(page.sessionId, 'Fetch.requestPaused', async event => {
    const route = new URL(event.request.url).pathname.split('/')[2];
    const method = event.request.method;
    let status = 200;
    let body = fixtures[route] || {};
    if (route === 'auth') {
      if (method === 'POST') { auth = JSON.parse(event.request.postData || '{}').password === 'test-only'; }
      if (method === 'DELETE') auth = false;
      status = auth || method === 'DELETE' ? 200 : 401;
      body = { authenticated: auth };
    } else if (method !== 'GET') {
      writes.push({ route, method, body: JSON.parse(event.request.postData || '{}') });
      body = { success: true };
    }
    await page.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: status,
      responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(body)).toString('base64') });
  });
  await page.goto('http://127.0.0.1:3100/admin', { settleMs: 1500 });
  assert.ok(await page.eval(() => !!document.querySelector('h1')), 'admin screen loaded');
  return page;
}
async function clickText(page, text) {
  await page.eval(value => {
    const button = [...document.querySelectorAll('button')].find(e => e.textContent.trim() === value);
    if (!button) throw Error('Missing button: ' + value);
    button.click();
  }, text);
  await sleep(180);
}
async function fill(page, selector, value) {
  await page.eval(({ selector, value }) => {
    const input = document.querySelector(selector);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, { selector, value });
}
try {
  const login = await setup(false);
  const baseline = process.argv.includes('--baseline');
  await login.screenshot({ path: `.taste-skill/profile-refresh/admin-${baseline ? 'before' : 'after'}-login.png` });
  const page = await setup(true);
  await page.screenshot({ path: `.taste-skill/profile-refresh/admin-${baseline ? 'before' : 'after'}-profile.png` });
  if (baseline) { console.log('Baseline login and authenticated admin captured with isolated API fixtures.'); }
  else {
    await fill(login, 'input[type="password"]', 'incorrect');
    await login.eval(() => document.querySelector('form').requestSubmit());
    await sleep(250);
    assert.ok(await login.eval(() => document.querySelector('[role="alert"]') !== null), 'login error visible');
    await fill(login, 'input[type="password"]', 'test-only');
    await login.eval(() => document.querySelector('form').requestSubmit());
    await sleep(300);
    assert.ok(await login.eval(() => !!document.querySelector('main')), 'successful login');
    await clickText(page, 'Lưu hồ sơ');
    assert.ok(writes.some(w => w.route === 'profile' && w.method === 'PATCH' && w.body.username === 'silentboiz'));
    const documentNode = await page.send('DOM.getDocument');
    const coverInput = await page.send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '#cover-input' });
    await page.send('DOM.setFileInputFiles', { nodeId: coverInput.nodeId, files: [resolve('public/assets/projects/profile.jpg')] });
    await sleep(400);
    assert.ok(await page.eval(() => !!document.querySelector('[aria-label="Hủy cắt ảnh"]')), 'image cropper opens');
    await page.setViewport({ width: 320, height: 640 });
    assert.equal(await page.eval(() => document.documentElement.scrollWidth <= innerWidth), true, 'cropper controls fit phone');
    await page.screenshot({ path: '.taste-skill/profile-refresh/admin-cropper-mobile.png' });
    await page.eval(() => document.querySelector('[aria-label="Hủy cắt ảnh"]').click());
    await page.setViewport({ width: 1440, height: 900 });
    for (const [tab, add] of [['Dự án', 'Thêm dự án'], ['Thiết bị', 'Thêm thiết bị'], ['Trò chơi', 'Thêm trò chơi'], ['Liên kết', 'Thêm liên kết']]) {
      await clickText(page, tab);
      assert.ok(await page.eval(() => document.querySelectorAll('tbody tr').length > 0), `${tab} rows`);
      await clickText(page, add);
      assert.ok(await page.eval(() => document.querySelector('[data-admin-dialog]') !== null), `${tab} dialog`);
      await page.screenshot({ path: `.taste-skill/profile-refresh/admin-dialog-${tab === 'Dự án' ? 'project' : tab === 'Thiết bị' ? 'gear' : tab === 'Trò chơi' ? 'game' : 'social'}.png` });
      await clickText(page, 'Hủy');
    }
    await clickText(page, 'Thiết bị');
    await page.eval(() => document.querySelector('button[aria-label="Chỉnh sửa"]').click());
    await sleep(150);
    assert.equal(await page.eval(() => document.querySelector('[data-admin-dialog] input').value), 'WAVE75', 'edit preserves current gear');
    await fill(page, '[data-admin-dialog] input', 'WAVE75 updated');
    await page.eval(() => document.querySelector('[data-admin-dialog] form').requestSubmit());
    await sleep(250);
    assert.ok(writes.some(w => w.route === 'gears' && w.method === 'PATCH' && w.body.name === 'WAVE75 updated' && w.body.brand === 'PMO'), 'editing retains brand and sends updated name');
    await clickText(page, 'Thêm thiết bị');
    assert.equal(await page.eval(() => document.querySelector('[data-admin-dialog] form').checkValidity()), false, 'empty required gear name rejected');
    await fill(page, '[data-admin-dialog] input', 'Another keyboard');
    await page.eval(() => document.querySelector('[data-admin-dialog] form').requestSubmit());
    await sleep(250);
    assert.ok(writes.some(w => w.route === 'gears' && w.method === 'POST' && w.body.name === 'Another keyboard'), 'add gear payload');
    for (const tab of ['Dự án', 'Trò chơi', 'Liên kết']) {
      await clickText(page, tab);
      await page.eval(() => document.querySelector('button[aria-label="Chỉnh sửa"]').click());
      await sleep(150);
      assert.ok(await page.eval(() => document.querySelector('[data-admin-dialog] input').value.length > 0), `${tab} populated edit form`);
      await clickText(page, 'Hủy');
    }
    await clickText(page, 'Thiết bị');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewport({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.eval(t => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
        await sleep(350);
        assert.equal(await page.eval(() => document.documentElement.scrollWidth <= innerWidth), true, `admin fits ${width} ${theme}`);
        await page.screenshot({ path: `.taste-skill/profile-refresh/admin-${width}-${theme}.png` });
      }
      await clickText(page, 'Thêm thiết bị');
      assert.ok(await page.eval(() => {
        const r = document.querySelector('[data-admin-dialog]').getBoundingClientRect();
        return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;
      }), `dialog fits ${width}`);
      await clickText(page, 'Hủy');
    }
    assert.deepEqual(page.consoleErrors, []);
    await page.setViewport({ width: 320, height: 640 });
    for (const [tab, add] of [['Dự án', 'Thêm dự án'], ['Thiết bị', 'Thêm thiết bị'], ['Trò chơi', 'Thêm trò chơi'], ['Liên kết', 'Thêm liên kết']]) {
      await clickText(page, tab);
      await clickText(page, add);
      assert.ok(await page.eval(() => {
        const shell = document.querySelector('[data-admin-dialog]').parentElement;
        const r = shell.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && shell.scrollHeight >= shell.clientHeight;
      }), `${tab} scrollable dialog fits short phone`);
      await clickText(page, 'Hủy');
    }
    await clickText(page, 'Đăng xuất');
    assert.ok(await page.eval(() => !!document.querySelector('input[type="password"]')));
    console.log('PASS: login failure/success, profile save, required fields, gear create/edit payloads, all five sections, four add/edit/cancel dialogs, light/dark, 320–1440px and short-phone fit, logout. All API writes intercepted.');
  }
} finally { await browser.close(); }
