const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 512, height: 480 }, recordVideo: { dir: process.argv[2]+'/vid2', size: { width: 512, height: 480 } } });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-1'));
  await p.addStyleTag({content:'touch-controls{display:none!important}'});
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  // flag touch with a clock ending in 3 -> 3 fireworks
  await p.evaluate(()=>{const pu=window.__inject.puppet; const pole=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-POLE'); window.__inject.hud.time=233; pu.x=pole.x-8; pu.y=pole.y+30; pu.speedY=0;});
  await p.waitForTimeout(16000);
  await ctx.close(); await b.close();
})();
