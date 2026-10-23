import assert from 'node:assert/strict';
import { Browser, sleep } from 'file:///C:/Users/Silentboiz/.codex/plugins/cache/claude-sync/taste-skill/2.1.4/skills/taste-skill/scripts/lib/cdp.mjs';
const browser = await Browser.launch();
try {
  const page = await browser.newPage({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3100/gears', { settleMs: 2200 });
  await page.eval(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await sleep(500);
  const start = await page.eval(() => scrollY);
  await page.eval(() => document.querySelector('footer a[href^="#"]').click());
  await sleep(150);
  const during = await page.eval(() => scrollY);
  assert.ok(during > 10 && during < start - 10, `animated return: start=${start}, during=${during}`);
  await sleep(1500);
  assert.ok(await page.eval(() => scrollY < 2), 'return reaches page top');
  await page.eval(() => window.scrollTo({ top: 800, behavior: 'instant' }));
  await sleep(600);
  const nav = await page.eval(() => {
    const active = document.querySelector('nav a[aria-current]');
    const inactive = document.querySelector('nav a:not([aria-current])');
    return { weight: +getComputedStyle(active).fontWeight, inactive: +getComputedStyle(inactive).fontWeight,
      line: getComputedStyle(active).textDecorationLine, blur: getComputedStyle(document.querySelector('header')).backdropFilter };
  });
  assert.ok(nav.weight > nav.inactive, 'active navigation is bold');
  assert.equal(nav.line, 'none');
  assert.ok(nav.blur.includes('blur('), 'compact navbar blurs background');
  console.log('PASS: smooth return to zero; bold active navigation, no underline, background blur');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewport({ width, height: 900 });
    const layout = await page.eval(() => ({ overflow: document.documentElement.scrollWidth > innerWidth,
      columns: getComputedStyle(document.querySelector('#collection article').parentElement).gridTemplateColumns.split(' ').length }));
    assert.equal(layout.overflow, false, `no overflow at ${width}`);
    assert.equal(layout.columns, width > 900 ? 4 : width > 600 ? 2 : 1, `gear columns at ${width}`);
  }
  await page.setViewport({ width: 1440, height: 900 });
  await page.screenshot({ path: '.taste-skill/profile-refresh/gear-refined.png' });
  await page.eval(() => document.querySelector('a[href="#main"]').click());
  await sleep(50);
  assert.ok(await page.eval(() => document.activeElement.id === 'main'), 'skip link retains immediate keyboard focus');
  console.log('PASS: compact catalogue at desktop/tablet/phone; skip link remains immediate');
} finally { await browser.close(); }
