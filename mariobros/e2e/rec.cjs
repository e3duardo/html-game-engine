const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 512, height: 480 }, recordVideo: { dir: process.argv[2]+'/vid', size: { width: 512, height: 480 } } });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-4'));
  await p.addStyleTag({content:'touch-controls{display:none!important}'});
  console.log(JSON.stringify(await p.evaluate(()=>{const r=document.querySelector('.Stage').getBoundingClientRect(); return [r.left,r.top,r.width,r.height]})));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3000);
  // keep mario alive for the recording (no blink): damage is a no-op
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.shrink=()=>{}; pu.x=126*16; pu.y=100;});
  await p.waitForTimeout(1500);
  // walk right across the bridge towards Bowser, jump a few times
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(1800); await p.keyboard.up('ArrowRight');
  for (let i=0;i<5;i++){ await p.keyboard.down('f'); await p.waitForTimeout(350); await p.keyboard.up('f'); await p.waitForTimeout(2000); }
  // grab the axe
  await p.evaluate(()=>{const pu=window.__inject.puppet; const axe=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-AXE'); pu.x=axe.x-8; pu.y=axe.y-12;});
  for (let i=0;i<9;i++){ await p.waitForTimeout(2000); console.log(i, await p.evaluate(()=>JSON.stringify({x:Math.round(window.__inject.puppet.x),y:Math.round(window.__inject.puppet.y),scroll:Math.round(window.__inject.scene.scroll_x),msg:document.querySelector('toad-message').style.display,toad:document.querySelector('npc-toad').offsetLeft}))); }
  await p.waitForTimeout(2000);
  await ctx.close(); await b.close();
})();
