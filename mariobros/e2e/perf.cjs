const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{const I=window.__inject; I.puppet.die=()=>{}; I.puppet.shrink=()=>{}; I.puppet.x=84*16; I.puppet.y=100;
    // many enemies: activate every goomba/koopa around and put them near mario
    const en=I.scene.collisionMap.filter(o=>o.enemy && o.tag.tagName!=='ENEMY-PIRANHA-PLANT');
    en.slice(0,12).forEach((e,i)=>{e.activated=true; e.x=84*16+ (i-6)*40; e.y=150; e.dead=false;});
    const g=I.game; const orig=g.gameLoop; window.__t=[]; 
    const wrap=()=>{ const t0=performance.now(); orig(); window.__t.push(performance.now()-t0); };
    g.pause(); g.gameLoop=wrap; g.resume();
  });
  await p.waitForTimeout(500); await p.evaluate(()=>{window.__t.length=0;});
  await p.waitForTimeout(4000);
  console.log(await p.evaluate(()=>{const t=window.__t.slice().sort((a,b)=>a-b); const sum=t.reduce((a,b)=>a+b,0); return JSON.stringify({ticks:t.length, avgMs:+(sum/t.length).toFixed(2), p95:+t[Math.floor(t.length*.95)].toFixed(2), max:+t[t.length-1].toFixed(2), nCollidables:window.__inject.scene.collisionMap.length, nScene:window.__inject.scene.sceneMap.length, nUpd:window.__inject.scene.updatableMap.length})}));
  await b.close();
})();
