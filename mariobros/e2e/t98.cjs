const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{const I=window.__inject; I.puppet.die=()=>{}; I.puppet.shrink=()=>{}; I.puppet.x=60*16; I.puppet.y=100;
    const k=I.scene.collisionMap.filter(o=>o.tag.tagName==='ENEMY-KOOPA-TROOPA')[2]; window.__k=k; k.activated=true;
    k.x=75*16; k.y=208-24; k.becomeShell({speedY:0,awardStompScore(){}}); k.kick(-1); });
  const out=[]; for(let i=0;i<14;i++){ await p.waitForTimeout(200); out.push(await p.evaluate(()=>{const k=window.__k; return Math.round(k.x)+','+Math.round(k.y)+','+k.height+','+k.state})); }
  console.log('shell slide', out.join(' | '));
  await b.close();
})();
