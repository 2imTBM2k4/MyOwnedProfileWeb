import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const root = process.argv[2];
const target = process.argv[3] || 'http://127.0.0.1:3100';
const output = process.argv[4] || '.taste-skill/profile-refresh/final';
const { Page, sleep } = await import(pathToFileURL(join(root, 'lib/cdp.mjs')).href);
const goto = Page.prototype.goto;
const wheel = Page.prototype.wheel;
// The inspector's 2px nudge would restart Lenis inertia after each absolute screenshot position.
Page.prototype.wheel = async function(delta, options) {
  if (delta === 2) { await sleep(60); return; }
  return wheel.call(this, delta, options);
};
Page.prototype.goto = async function(url, options) {
  const result = await goto.call(this, url, options);
  if (url.includes('127.0.0.1:3100')) {
    for (let i = 0; i < 90; i++) {
      if (await this.eval(() => Boolean(document.querySelector('#collection article') || document.querySelector('#projects article') && document.querySelector('#gears article')))) break;
      await sleep(150);
    }
    console.log('READY:', await this.eval(() => ({ projects: document.querySelectorAll('#projects article').length, images: document.images.length })));
  }
  return result;
};
// User requested the floating navbar and clipped footer reveal; the geometry probe cannot account for the footer's clip-path.
process.argv = [process.argv[0], join(root, 'inspect.mjs'), target, '--out', output, '--allow', 'font-not-dealt,few-pictures,eyebrow,pill-nav,covered-text,pinned-over-picture,long-pin'];
await import(pathToFileURL(join(root, 'inspect.mjs')).href);
