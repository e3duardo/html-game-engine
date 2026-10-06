const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-1'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.grow(false); pu.becomeFire(false);});
  await p.waitForTimeout(300);
  await p.keyboard.press('d'); await p.waitForTimeout(150);
  console.log('normal play fireballs', await p.evaluate(()=>document.querySelectorAll('item-fireball').length));
  await b.close();
})();
