import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const artifacts = join(tmpdir(), 'silentboiz-admin-check');
mkdirSync(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true });
const pdf = Buffer.from('%PDF-1.7\nbrowser fixture');
let createdTestCv = false;
let expectedDownload = pdf;
try {
  const context = await browser.newContext({ baseURL, viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  for (const cookie of ['', 'admin_token=forged']) {
    for (const path of ['/api/projects', '/api/cv']) {
      const response = await context.request.post(path, { headers: { Cookie: cookie }, data: {} });
      assert.equal(response.status(), 401, `${path}: reject ${cookie ? 'forged' : 'absent'} cookie`);
    }
  }
  const projectsResponse = await context.request.get('/api/projects');
  assert.equal(projectsResponse.status(), 200);
  const actualProjects = await projectsResponse.json();
  assert.ok(actualProjects.length > 0, 'Anonymous API must show existing projects');
  const detail = await context.request.get(`/api/projects/${actualProjects[0].id}`);
  assert.equal(detail.status(), 200);
  assert.equal((await detail.json()).id, actualProjects[0].id);
  assert.equal((await context.request.get('/api/auth')).status(), 401);
  assert.equal((await context.request.post('/api/auth', { data: { password: 'intentionally-wrong-test-password' } })).status(), 401);
  assert.equal((await context.request.post('/api/auth', { data: { password: process.env.ADMIN_PASSWORD } })).status(), 200);
  assert.equal((await context.request.get('/api/auth')).status(), 200);
  const invalidForm = { multipart: { file: { name: 'fake.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') } } };
  assert.equal((await context.request.post('/api/cv', invalidForm)).status(), 400);
  const originalCv = await context.request.get('/api/cv');
  if (originalCv.status() === 404) {
    const uploaded = await context.request.post('/api/cv', { multipart: { file: { name: 'cv.pdf', mimeType: 'application/pdf', buffer: pdf } } });
    assert.equal(uploaded.status(), 201);
    createdTestCv = true;
    assert.deepEqual(await (await context.request.get('/api/cv')).body(), pdf);
  } else {
    assert.equal(originalCv.status(), 200);
    expectedDownload = await originalCv.body();
  }
  console.log(`PASS: real API shows ${actualProjects.length} projects and project detail; auth rejects absent/forged cookies and wrong password; signed login and PDF validation work`);

  const projects = [
    { id: 'z', title: 'Zebra', description: 'Test description', tags: ['Node.js'], status: 'active', image_url: '/broken-test-image', created_at: '2026-01-01' },
    { id: 'a', title: 'Alpha', description: null, tags: ['Docker', 'featured'], status: 'completed', image_url: null, created_at: '2026-02-01' },
  ];
  const gears = [
    { id: 'g10', name: 'Gear 10', brand: 'Z', category: 'Mouse', status: 'retired', image_url: '/favicon.ico' },
    { id: 'g2', name: 'Gear 2', brand: 'A', category: 'Keyboard', status: 'active', image_url: '/broken-test-image' },
  ];
  const games = [
    { id: 'game-z', title: 'Z Game', publisher: 'Z Studio', profile_url: null, image_url: null, status: 'offline' },
    { id: 'game-a', title: 'A Game', publisher: 'A Studio', profile_url: 'https://example.com', image_url: '/favicon.ico', status: 'online' },
  ];
  const socials = [{ id: 's-z', platform: 'Z', url: 'https://z.example.com' }, { id: 's-a', platform: 'A', url: 'https://a.example.com' }];
  let cvUploaded = false;
  let cvFailure = false;
  let projectsFailure = false;
  await context.route('**/api/cv', async route => {
    const method = route.request().method();
    if (method === 'HEAD') return route.fulfill({ status: cvUploaded ? 200 : 404, body: '' });
    if (method === 'POST') {
      if (cvFailure) return route.fulfill({ status: 503, json: { error: 'Storage unavailable for test' } });
      cvUploaded = true;
      return route.fulfill({ status: 201, json: { success: true } });
    }
    return route.continue();
  });
  for (const [path, data] of [['projects', projects], ['gears', gears], ['games', games], ['social-links', socials]]) {
    await context.route(`**/api/${path}`, route => {
      if (route.request().method() !== 'GET') return route.fulfill({ status: 503, json: { error: 'Project save failed for test' } });
      if (path === 'projects' && projectsFailure) return route.fulfill({ status: 503, json: { error: 'Project load failed for test' } });
      return route.fulfill({ json: data });
    });
  }
  await context.route('**/api/projects/*', route => route.fulfill({ json: [{ id: 'fixture' }] }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await page.getByText('Chưa có CV. Tải lên để hiện nút tải xuống ở đầu trang.', { exact: true }).waitFor();
  await page.locator('#cv-upload').setInputFiles({ name: 'fake.pdf', mimeType: 'application/pdf', buffer: Buffer.from('forged') });
  await page.getByRole('alert').filter({ hasText: 'Nội dung tệp không phải PDF hợp lệ.' }).waitFor();
  await page.locator('#cv-upload').setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByRole('link', { name: 'Tải CV hiện tại' }).waitFor();
  cvFailure = true;
  await page.locator('#cv-upload').setInputFiles({ name: 'replacement.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByRole('alert').filter({ hasText: 'Storage unavailable for test' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Tải CV hiện tại' }).count(), 1);
  console.log('PASS: CV missing/upload/failure UI, invalid PDF feedback, existing download remains after failed replacement');

  for (const [tab, heading, first, last] of [
    ['Dự án', 'Tên dự án & Mô tả', 'Alpha', 'Zebra'],
    ['Thiết bị', 'Tên', 'Gear 2', 'Gear 10'],
    ['Trò chơi', 'Tên trò chơi', 'A Game', 'Z Game'],
    ['Liên kết', 'Nền tảng', 'A', 'Z'],
  ]) {
    await page.getByRole('navigation', { name: 'Các mục quản lý' }).getByRole('button', { name: tab, exact: true }).click();
    const button = page.locator('thead').getByRole('button', { name: heading, exact: true });
    await button.click();
    assert.ok((await page.locator('tbody tr').first().innerText()).includes(first), `${tab}: ascending`);
    assert.equal(await button.locator('..').getAttribute('aria-sort'), 'ascending');
    await button.focus();
    await page.keyboard.press('Enter');
    assert.ok((await page.locator('tbody tr').first().innerText()).includes(last), `${tab}: descending`);
    assert.equal(await button.locator('..').getAttribute('aria-sort'), 'descending');
    // Every data column supports sorting; none may break when empty.
    for (const other of await page.locator('thead button').all()) await other.click();
  }
  console.log('PASS: four tables sort both directions, keyboard Enter, aria-sort and all sortable data columns');
  await page.getByRole('navigation').getByRole('button', { name: 'Thiết bị', exact: true }).click();
  await page.getByLabel('Chưa có ảnh', { exact: true }).first().waitFor();
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.classList.toggle('dark', theme === 'dark'), theme);
    const colors = await page.locator('[data-status]').evaluateAll(nodes => nodes.map(node => ({ status: node.dataset.status, color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor })));
    assert.notEqual(colors[0].color, colors[1].color);
    await page.screenshot({ path: join(artifacts, `gears-${theme}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Admin must not overflow the viewport');
  await page.screenshot({ path: join(artifacts, 'gears-mobile.png'), fullPage: true });

  await page.getByRole('navigation').getByRole('button', { name: 'Dự án', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm dự án', exact: false }).click();
  await page.getByLabel('Tên dự án').fill('Keep this unsaved project');
  await page.getByRole('button', { name: 'Tạo dự án', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Project save failed for test' }).waitFor();
  assert.equal(await page.getByLabel('Tên dự án').inputValue(), 'Keep this unsaved project');
  await page.getByRole('button', { name: 'Hủy', exact: true }).click();
  projectsFailure = true;
  await page.getByTitle('Bỏ đánh dấu nổi bật').click();
  await page.getByRole('alert').filter({ hasText: 'Project load failed for test' }).waitFor();
  assert.equal(await page.locator('tbody tr').count(), 2, 'Failed refresh keeps previous projects');
  projectsFailure = false;
  await page.getByRole('button', { name: 'Tải lại dự án' }).click();
  await page.getByRole('alert').filter({ hasText: 'Project load failed for test' }).waitFor({ state: 'hidden' });
  console.log('PASS: missing/broken image fallback, status colors in both themes, mobile table overflow, failed project save keeps form, failed refresh keeps data, retry recovers');

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  assert.equal(await page.getByRole('link', { name: 'Tải CV', exact: true }).count(), 1);
  assert.equal(await page.locator('a[href="mailto:2004.tranbinhminh@gmail.com"]').count(), 2);
  assert.equal(await page.getByText('Ho Chi Minh City, Vietnam', { exact: true }).count(), 1);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Homepage must not overflow mobile viewport');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Tải CV', exact: true }).click()]);
  assert.equal(download.suggestedFilename(), 'Tran-Binh-Minh-CV.pdf');
  assert.deepEqual(readFileSync(await download.path()), expectedDownload);
  await page.screenshot({ path: join(artifacts, 'home-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.screenshot({ path: join(artifacts, 'home-desktop.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: homepage CV attachment and bytes, contact email/location, mobile layout, no browser runtime errors');
  console.log(`Screenshots: ${artifacts}`);
} finally {
  await browser.close();
  if (createdTestCv) {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    const storage = client.storage.from('cvs');
    const { data, error } = await storage.download('cv.pdf');
    if (!error && Buffer.from(await data.arrayBuffer()).equals(pdf)) {
      const result = await storage.remove(['cv.pdf']);
      if (result.error) throw new Error('Could not clean up browser test CV: ' + result.error.message);
      console.log('Removed temporary test CV; original missing-CV state restored.');
    }
  }
}
