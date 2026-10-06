const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-1'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  console.log(await p.evaluate(async()=>{
    const I=window.__inject, map=I.scene.collisionMap, out=[];
    const koopa=map.find(o=>o.tag.tagName==='ENEMY-KOOPA-TROOPA');
    const q=map.find(o=>o.tag.tagName==='ITEM-QUESTION' && !o.disabled);
    const gb=map.filter(o=>o.tag.tagName==='ENEMY-GOOMBA')[0];
    // revive
    koopa.activated=true; koopa.state='shell'; koopa._shellTicks=336-3; koopa.speedX=0;
    await new Promise(r=>setTimeout(r,150)); out.push('koopa after revive: '+koopa.state);
    // bump: put goomba + koopa on the question block, then bump it
    I.puppet.x=q.x-40; I.puppet.y=100;
    gb.activated=true; gb.x=q.x; gb.y=q.y-gb.height; gb.speedX=0; gb.dead=false;
    const s0=I.hud.score;
    q.collide(I.puppet,{top:true,bottom:false,left:false,right:false});
    await new Promise(r=>setTimeout(r,200));
    out.push('goomba dead after bump: '+gb.dead+' score +'+(I.hud.score-s0));
    // kick score: stationary shell
    koopa.dead=false; koopa.state='shell'; koopa._shellTicks=0; koopa.tag.classList.add('shell');
    const s1=I.hud.score; koopa.awardKick({comboKills:0}); out.push('kick +'+(I.hud.score-s1));
    koopa._shellTicks=336-30; const s2=I.hud.score; koopa.awardKick({comboKills:0}); out.push('kick near wake +'+(I.hud.score-s2));
    out.push('chain '+[1,2,3,4,5,6,7,8].map(()=>koopa.chainScore()).join(','));
    return out.join('\n');
  }));
  await b.close();
})();
