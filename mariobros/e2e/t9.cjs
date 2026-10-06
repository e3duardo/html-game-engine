const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-3'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  const info = await p.evaluate(()=>{const q=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-QUESTION'&&o.tag.getAttribute('powerup')); const f=window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='SCENE-FLOOR').map(o=>[o.x,o.y,o.width,o.height]); return {q:[q.x,q.y], f:f.slice(0,12), h:window.__inject.scene.height}});
  console.log(JSON.stringify(info));
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=59*16; pu.y=100; pu.speedX=0; pu.speedY=0;});
  await p.waitForTimeout(800);
  await p.keyboard.down('f'); await p.waitForTimeout(300); await p.keyboard.up('f');
  for (let i=0;i<30;i++){ console.log(await p.evaluate(()=>{const pu=window.__inject.puppet; const m=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-MUSHROOM'); return JSON.stringify({x:pu.x,y:Math.round(pu.y),big:pu.big,dying:pu.dying,m:m&&[m.x,m.y,m.dead]})})); await p.waitForTimeout(200);}
  await b.close();
})();
