import { Browser, sleep } from 'file:///C:/Users/Silentboiz/.codex/plugins/cache/claude-sync/taste-skill/2.1.4/skills/taste-skill/scripts/lib/cdp.mjs';
const b = await Browser.launch();
try {
  for (const [name, url] of [['sakib', 'https://ssakib-portfolio.vercel.app/'], ['melvin', 'https://melvinbiju.vercel.app/']]) {
    const p = await b.newPage();
    await p.goto(url, { settleMs: 2500 });
    await p.screenshot({ path: `.taste-skill/profile-refresh/${name}-top.jpg` });
    await p.wheel(750);
    await sleep(1600);
    await p.screenshot({ path: `.taste-skill/profile-refresh/${name}-scroll.jpg` });
    console.log(name, 'nav', await p.eval(() => [...document.querySelectorAll('header, nav')].map(e => ({ text: e.innerText, position: getComputedStyle(e).position, top: getComputedStyle(e).top, rect: e.getBoundingClientRect().toJSON() }))));
    await p.eval(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await sleep(2500);
    await p.screenshot({ path: `.taste-skill/profile-refresh/${name}-bottom.jpg` });
    console.log(name, 'footer', await p.eval(() => [...document.querySelectorAll('footer')].map(e => ({ text: e.innerText, position: getComputedStyle(e).position, height: e.offsetHeight, transform: getComputedStyle(e).transform, parent: { tag: e.parentElement.tagName, style: e.parentElement.getAttribute('style'), classes: e.parentElement.className } }))));
  }
} finally { await b.close(); }
