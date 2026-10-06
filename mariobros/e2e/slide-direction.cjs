// 1-3 sliding platforms: prints each one's offset from its origin over time
// relative to its x attribute (SMBDIS XMovingPlatform, counters start at spawn: goes RIGHT first, up to ~52px, then back to 0).
const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 500 } });
  await p.goto(url('1-3'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  // platforms only start moving once the screen reaches them
  await p.evaluate(() => { const I = window.__inject; I.puppet.die = () => {}; I.puppet.x = 80 * 16; });
  const els = await p.$$('scenario-elevator[motion="slide"]');
  const origin = await Promise.all(els.map((e) => e.evaluate((n) => Number(n.getAttribute('x')) * 16)));
  const trace = [];
  for (let i = 0; i < 24; i++) {
    trace.push(await Promise.all(els.map((e, k) => e.evaluate((n) => Math.round(n.offsetLeft)).then((v) => v - origin[k]))));
    await p.waitForTimeout(250);
  }
  console.log(trace.map((r) => r.join(' ')).join('\n'));
  await b.close();
})();
