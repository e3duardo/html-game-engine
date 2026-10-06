const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url());
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  const r = await p.evaluate(async () => {
    const pu = window.__inject.puppet; const out = [];
    const bar = [...window.__inject.scene.collisionMap].find(o => o.tag.tagName==='ENEMY-FIRE-BAR');
    out.push('pivot '+bar.x+','+bar.y+' dying0='+pu.dying);
    // park mario on the bar's 3rd ball path: wait until it passes through
    out.push('big='+pu.big+' inv='+pu.invincible+' star='+pu.starPower+' w/h '+pu.width+'/'+pu.height);
    const t=setInterval(()=>{pu.x = bar.x + 16 - pu.width/2; pu.y = bar.y - pu.height/2; pu.speedX=0; pu.speedY=0;},5);
    await new Promise(r=>setTimeout(r,5000)); clearInterval(t);
    out.push('dying='+pu.dying+' steps '+bar._step+' act '+bar.activated);
    return out;
  });
  console.log(r);
  await b.close();
})();
