const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => m.type()==='error' && console.log('CERR', m.text()));
  await p.goto(url('1-4'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.starPower=false; pu.invincible=true; pu.x=129*16; pu.y=100;});
  const st=()=>p.evaluate(()=>{const o=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-BOWSER'); return o&&JSON.stringify({x:+o.x.toFixed(1),y:+o.y.toFixed(1),act:o.activated,hp:o.hitPoints,def:o.defeated,dead:o.dead,mouth:o.mouthOpen,flames:document.querySelectorAll('enemy-koopa-fire').length,cls:o.tag.className})});
  for (let i=0;i<16;i++){ console.log(i, await st()); await p.waitForTimeout(1000);}
  await p.screenshot({path:process.argv[2]+'/bowser.png'});
  for (let i=0;i<5;i++) await p.evaluate(()=>window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-BOWSER').defeatByFire());
  for (let i=0;i<5;i++){ console.log('after', await st()); await p.waitForTimeout(1000);}
  await b.close();
})();
