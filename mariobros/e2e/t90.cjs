const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
  const x=()=>p.evaluate(()=>Math.round(window.__inject.puppet.x));
  console.log('walking x', await x()); await p.waitForTimeout(500); console.log('x', await x());
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const a=await x(); await p.waitForTimeout(1200); const c=await x(); console.log('paused x', a, c, 'paused=', await p.evaluate(()=>window.__inject.game.paused));
  await p.keyboard.press('Enter'); await p.waitForTimeout(800); console.log('resumed x', await x());
  await p.waitForTimeout(6000); console.log('after cutscene x', await x());
  // fireball during castle animation (1-1)
  await p.goto(url('1-1')); await p.reload();
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.grow(false); pu.becomeFire(false); const pole=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-POLE'); pu.x=pole.x-8; pu.y=pole.y+30;});
  await p.waitForTimeout(3500);
  console.log('winning', await p.evaluate(()=>window.__inject.puppet.winning));
  await p.keyboard.press('d'); await p.keyboard.press('Shift'); await p.waitForTimeout(300);
  console.log('fireballs while winning', await p.evaluate(()=>document.querySelectorAll('item-fireball').length));
  await b.close();
})();
