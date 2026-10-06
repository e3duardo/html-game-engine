const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-3'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  const get = ()=>p.evaluate(()=>{const e=window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='ENEMY-PARA-TROOPA'); return e.map(o=>[Math.round(o.x),Math.round(o.y),o.flying,o.dead,o.activated])});
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=74*16-120; pu.y=100;});
  for (let i=0;i<8;i++){ console.log(JSON.stringify(await get())); await p.waitForTimeout(1000);}
  // stomp test
  await p.evaluate(()=>{const e=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-PARA-TROOPA'); const pu=window.__inject.puppet; pu.x=e.x; pu.y=e.y-20; pu.speedY=3;});
  await p.waitForTimeout(300);
  console.log('after stomp', JSON.stringify(await get()), await p.evaluate(()=>window.__inject.puppet.dying));
  await p.waitForTimeout(1500); console.log(JSON.stringify(await get()));
  await b.close();
})();
