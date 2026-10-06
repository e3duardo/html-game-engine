const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-3'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  // mario standing on top of platform at x=50 (800..864), then spawn mushroom right on him
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=820; pu.y=150; pu.speedX=0; pu.speedY=0;});
  await p.waitForTimeout(800);
  await p.evaluate(()=>{ const m=window.__inject.scene.spawn('item-mushroom',{x:51,y:2}); });
  for (let i=0;i<20;i++){ console.log(await p.evaluate(()=>{const pu=window.__inject.puppet; return JSON.stringify({x:pu.x,y:Math.round(pu.y),h:pu.height,big:pu.big,dying:pu.dying,sc:pu.scripted,og:pu.onGround})})); await p.waitForTimeout(150);}
  await b.close();
})();
