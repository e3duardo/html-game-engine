// 1-3 sway platform (x=55): stays at its top until the screen reaches it,
// then swings; after a death/reset it is back at the top, asleep.
const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 500 } });
  await p.goto(url('1-3'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  const y = () => p.evaluate(() => Math.round(parseFloat(document.querySelector('scenario-elevator[motion="sway"]').style.bottom)));
  const out = [await y()];
  await p.waitForTimeout(1500); out.push(await y());
  await p.evaluate(() => { const I = window.__inject; I.puppet.die = () => {}; I.puppet.x = 50 * 16; });
  for (let i = 0; i < 8; i++) { await p.waitForTimeout(600); out.push(await y()); }
  console.log(out.join(' '));
  // reset() itself puts it back at the top (read right away, before the next tick)
  console.log('after reset', await p.evaluate(() => {
    const e = window.__inject.scene.collisionMap.find((o) => o.motion === 'sway');
    e.reset();
    return Math.round(parseFloat(e.tag.style.bottom));
  }));
  await b.close();
})();
