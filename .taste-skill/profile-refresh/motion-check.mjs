import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { Browser, sleep } = await import(pathToFileURL(process.argv[2]).href);
const b = await Browser.launch();
try {
  const p = await b.newPage({ width: 1440, height: 900 });
  await p.goto('http://127.0.0.1:3100', { settleMs: 1300 });
  assert.equal(await p.eval(() => document.querySelectorAll('h1 [data-name-word]').length), 3, 'hero has a three-word reveal');
  for (let i = 0; i < 60; i++) {
    if (await p.eval(() => document.querySelectorAll('#projects article img').length >= 2)) break;
    await sleep(200);
  }
  assert.equal(await p.eval(() => document.querySelectorAll('#projects article img').length >= 2), true, 'known projects show real screenshots');
  await p.eval(() => document.querySelector('#projects').scrollIntoView({ behavior: 'instant' }));
  await sleep(1000);
  const point = await p.eval(() => { const r = document.querySelector('[data-project-preview]').getBoundingClientRect(); return { x: r.right - 30, y: r.top + 30 }; });
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await sleep(400);
  assert.notEqual(await p.eval(() => getComputedStyle(document.querySelector('[data-project-preview] a > div')).transform), 'none', 'project responds to pointer');
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
  await sleep(1200);
  assert.equal(await p.eval(() => { const m = new DOMMatrix(getComputedStyle(document.querySelector('[data-project-preview] a > div')).transform); return Math.abs(m.m12) < .001 && Math.abs(m.m13) < .001 && Math.abs(m.m23) < .001; }), true, 'preview settles after pointer leaves');
  const reduced = await b.newPage({ width: 390, height: 844, reducedMotion: true });
  await reduced.goto('http://127.0.0.1:3100');
  assert.equal(await reduced.eval(() => document.querySelectorAll('h1 [data-name-word]').length), 3);
  assert.equal(await reduced.eval(() => document.getAnimations().filter(a => a.playState === 'running').length), 0, 'reduced motion has no running animation');
  assert.equal(await reduced.eval(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(p.consoleErrors, []);
  assert.deepEqual(reduced.consoleErrors, []);
  console.log('PASS: hero word reveal, actual project screenshots, pointer response/reset, reduced-motion fallback, mobile fit');
} finally { await b.close(); }
