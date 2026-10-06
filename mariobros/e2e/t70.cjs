const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  let p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-1'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  console.log('KNOCK', await p.evaluate(async()=>{
    const I=window.__inject; const g=I.scene.collisionMap.filter(o=>o.tag.tagName==='ENEMY-GOOMBA')[0]; const k=I.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-KOOPA-TROOPA');
    I.puppet.x=g.x-60; g.activated=true; const y0=g.y; const out=[];
    g.defeatByFire();
    for(let i=0;i<8;i++){ out.push(Math.round(g.y-y0)+(g.tag.classList.contains('knocked')?'K':'')); await new Promise(r=>setTimeout(r,150)); }
    await new Promise(r=>setTimeout(r,1500)); out.push('gone='+!document.contains(g.tag));
    return out.join(' ');
  }));
  console.log('FLASH', await p.evaluate(async()=>{
    const pu=window.__inject.puppet; pu.grow(false); await new Promise(r=>setTimeout(r,300)); pu.becomeFire();
    await new Promise(r=>setTimeout(r,300)); const mid=pu.tag.className; await new Promise(r=>setTimeout(r,1200)); return mid+' || end '+pu.tag.className+' frozen='+window.__inject.game.worldFrozen;
  }));
  // run timer: run, release B for a few ticks keeping right
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=20*16; pu.y=150; pu.speedX=0;});
  await p.waitForTimeout(500);
  await p.keyboard.down('ArrowRight'); await p.keyboard.down('d'); await p.waitForTimeout(900);
  await p.keyboard.up('d'); const v=[]; for (let i=0;i<6;i++){ v.push(await p.evaluate(()=>+window.__inject.puppet.speedX.toFixed(2))); await p.waitForTimeout(40);} console.log('RUNTIMER speed after releasing B', v.join(' '));
  await p.keyboard.up('ArrowRight');
  await p.close();
  p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  console.log('PLANT', await p.evaluate(()=>{
    const pl=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-PIRANHA-PLANT'); pl._offset=24; const t=pl.y+0, x=pl.x;
    const mk=(fx,fy)=>pl.hitByFireball({x:fx,y:fy});
    return ['on head ('+mk(x+4,t+14)+')','above head ('+mk(x+4,t-12)+')','beside 6px ('+mk(x-8,t+14)+')'].join(' ');
  }));
  await b.close();
})();
