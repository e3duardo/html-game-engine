const { chromium, url } = require('./lib.cjs');
const BASE=url();
async function boot(b, route){
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', route, e.message));
  p.on('console', m => m.type()==='error' && console.log('CERR', route, m.text().slice(0,200)));
  await p.goto(BASE+'#'+route);
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(route==='1-2'?9000:3500);
  return p;
}
(async () => {
  const b = await chromium.launch();
  // --- grow/shrink + pause + slide on 1-1
  let p = await boot(b,'1-1');
  console.log('GROW', await p.evaluate(async()=>{
    const pu=window.__inject.puppet, g=window.__inject.game; const out=[];
    pu.grow();
    for(let i=0;i<14;i++){ out.push(pu.tag.className.split(' ').filter(c=>/sizing-pose|big|right/.test(c)).join('.')+'|'+g.worldFrozen+'|'+pu.scripted); await new Promise(r=>setTimeout(r,80)); }
    await new Promise(r=>setTimeout(r,500));
    out.push('end '+pu.tag.className+' frozen='+g.worldFrozen+' scripted='+pu.scripted+' h='+pu.height);
    return out.join('  ');
  }));
  console.log('SHRINK', await p.evaluate(async()=>{
    const pu=window.__inject.puppet, g=window.__inject.game; const out=[];
    pu.invincible=false; pu.shrink();
    for(let i=0;i<8;i++){ out.push(pu.tag.className.split(' ').filter(c=>/sizing-pose|big/.test(c)).join('.')); await new Promise(r=>setTimeout(r,100)); }
    await new Promise(r=>setTimeout(r,800));
    out.push('end h='+pu.height+' frozen='+g.worldFrozen+' scripted='+pu.scripted);
    return out.join('  ');
  }));
  // slide: run right then hold down
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.invincible=false; pu.grow(false); });
  await p.waitForTimeout(300);
  await p.keyboard.down('ArrowRight'); await p.keyboard.down('d'); await p.waitForTimeout(900);
  const v0 = await p.evaluate(()=>window.__inject.puppet.speedX);
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(150);
  const v1 = await p.evaluate(()=>window.__inject.puppet.speedX);
  await p.waitForTimeout(400);
  const v2 = await p.evaluate(()=>window.__inject.puppet.speedX);
  await p.keyboard.up('ArrowDown'); await p.keyboard.up('ArrowRight'); await p.keyboard.up('d');
  console.log('SLIDE speeds run/after150ms/after550ms', v0, v1, v2);
  // pause
  const t0 = await p.evaluate(()=>window.__inject.game.ticks); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  const t1 = await p.evaluate(()=>window.__inject.game.ticks); await p.waitForTimeout(500);
  const t2 = await p.evaluate(()=>window.__inject.game.ticks);
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  const t3 = await p.evaluate(()=>window.__inject.game.ticks);
  console.log('PAUSE ticks (running->paused->paused->resumed)', t0,t1,t2,t3);
  // flagpole + castle celebration
  await p.evaluate(()=>{const pu=window.__inject.puppet; const pole=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-POLE'); window.__inject.hud.time=253; pu.x=pole.x-8; pu.y=pole.y+30; pu.speedY=0;});
  await p.waitForTimeout(500);
  await p.waitForTimeout(12000);
  console.log('FLAG', await p.evaluate(()=>({score:window.__inject.hud.score, vis:window.__inject.puppet.tag.style.visibility, flag:document.querySelector('building-castle .star-flag').className, clear:document.querySelector('level-clear').style.display, fw:document.querySelectorAll('.Fireworks').length})));
  await p.close();

  // --- 1-4 firebars, bowser, axe
  p = await boot(b,'1-4');
  console.log('FB', await p.evaluate(()=>window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='ENEMY-FIRE-BAR').map(o=>[Math.round(o.x/16),o.spinDirection]).join(' ')));
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.invincible=true; pu.x=131*16; pu.y=100;});
  await p.waitForTimeout(3000);
  await p.evaluate(()=>{const pu=window.__inject.puppet; const axe=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-AXE'); pu.x=axe.x-4; pu.y=axe.y-10;});
  for (let i=0;i<14;i++){ console.log('AXE', i, await p.evaluate(()=>{const b=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-BOWSER'); const br=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='SCENE-BRIDGE'); return JSON.stringify({bowY:b&&Math.round(b.y), dead:b&&b.dead, brW:br.tag.style.width, mx:Math.round(window.__inject.puppet.x), msg:document.querySelector('toad-message').style.display})})); await p.waitForTimeout(700);}
  await p.close();

  // --- 1-3 elevators
  p = await boot(b,'1-3');
  for (let i=0;i<5;i++){ console.log('ELEV', await p.evaluate(()=>window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='SCENARIO-ELEVATOR').map(o=>o.motion+':'+Math.round(o.motion==='slide'?o._left:o.bottomPos)).join(' '))); await p.waitForTimeout(1500);}
  await p.close();
  await b.close();
})();
