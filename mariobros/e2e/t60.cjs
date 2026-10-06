const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.shrink=()=>{}; pu.x=69*16; pu.y=100;});
  for (let i=0;i<30;i++){
    const r = await p.evaluate(()=>window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='ENEMY-KOOPA-TROOPA').map(o=>[Math.round(o.x),Math.round(o.y),o.state,o.dead?'D':''].join(',')).join(' | '));
    console.log(i, r);
    await p.waitForTimeout(700);
  }
  await b.close();
})();
