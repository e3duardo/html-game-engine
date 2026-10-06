const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-1'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{ const pu=window.__inject.puppet; const pole=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-POLE'); window.__inject.hud.time=36; window.__inject.hud.score=0; window.__inject.hud.clockStopped=false; pu.x=pole.x-8; pu.y=pole.y+30; pu.speedY=0;});
  for(let i=0;i<30;i++){ await p.waitForTimeout(1000); console.log(i, await p.evaluate(()=>JSON.stringify({s:window.__inject.hud.score,t:window.__inject.hud.time,x:Math.round(window.__inject.puppet.x),fw:document.querySelectorAll('.Fireworks').length,flag:document.querySelector('building-castle .star-flag').className}))); }
  console.log(await p.evaluate(()=>({score:window.__inject.hud.score, digitNote:'time was 10 then ticked', clear:document.querySelector('level-clear').style.display})));
  await b.close();
})();
