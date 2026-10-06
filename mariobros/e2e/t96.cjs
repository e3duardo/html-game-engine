const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  for (const route of ['1-1','1-2','1-3']) {
    const p = await b.newPage({ viewport: { width: 512, height: 480 } });
    p.on('pageerror', e => console.log('PAGEERR', e.message));
    await p.goto(url(route));
    await p.addStyleTag({content:'touch-controls{display:none!important}'});
    await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(route==='1-2'?9500:3500);
    // walk naturally towards the pole: teleport a screen before it, hold right+run, jump into the pole
    await p.evaluate(()=>{const I=window.__inject; const pole=I.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-POLE'); I.puppet.die=()=>{}; I.puppet.x=pole.x-180; I.puppet.y=100; I.puppet.speedX=0;});
    await p.waitForTimeout(800);
    await p.keyboard.down('ArrowRight'); await p.keyboard.down('d');
    let touched=false;
    for (let i=0;i<60;i++){ await p.waitForTimeout(150); if (await p.evaluate(()=>window.__inject.puppet.winning)) { touched=true; break; } if (i%6===0){ await p.keyboard.down('f'); await p.waitForTimeout(250); await p.keyboard.up('f'); } }
    await p.keyboard.up('ArrowRight'); await p.keyboard.up('d');
    const at = await p.evaluate(()=>window.__inject.scene.scroll_x);
    await p.waitForTimeout(9000);
    console.log(route, 'touched', touched, JSON.stringify(await p.evaluate(()=>{const I=window.__inject; const sc=I.scene.scroll_x; const castles=[...document.querySelectorAll('building-castle')].map(c=>({x:c.offsetLeft,w:c.offsetWidth})).filter(c=>c.x>=sc-400).pop(); return {scrollAtEnd:sc, castleX:castles&&castles.x, castleRight:castles&&castles.x+castles.w, viewRight:sc+256, marioX:Math.round(I.puppet.x), vis:I.puppet.tag.style.visibility, clear:document.querySelector('level-clear').style.display, sw:I.scene.width}})), 'scrollAtTouch', at);
    await p.screenshot({path:process.argv[2]+`/end${route}.png`, clip:{x:58,y:39,width:396,height:372}});
    await p.close();
  }
  await b.close();
})();
