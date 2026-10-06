const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-3'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  const pl = await p.evaluate(()=>window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='FLOATING-PLATFORM').slice(0,3).map(o=>[o.x,o.y,o.width,o.height,o.border.bottom]));
  console.log(JSON.stringify(pl));
  const [x,y,w,h] = pl[2];
  await p.evaluate(([x,y,h])=>{const pu=window.__inject.puppet; pu.x=x+24; pu.y=y+h+12; pu.speedX=0; pu.speedY=-6;},[x,y,h]);
  let min=1e9; for(let i=0;i<15;i++){ min=Math.min(min, await p.evaluate(()=>window.__inject.puppet.y)); await p.waitForTimeout(20);}
  console.log('platform bottom', y+h, 'mario min head y', Math.round(min));
  await b.close();
})();
