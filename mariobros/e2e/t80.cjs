const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.addInitScript(()=>{});
  await p.goto(url('1-1'));
  await p.addStyleTag({content:'touch-controls{display:none!important}'});
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; const pole=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-POLE'); window.__inject.hud.time=100; pu.x=pole.x-8; pu.y=pole.y+30; pu.speedY=0;});
  // wait until route changes
  let i=0;
  for (; i<80; i++){ await p.waitForTimeout(500); const r = await p.evaluate(()=>window.__inject.router.current); if (r==='1-2') break; }
  console.log('route 1-2 after', i*0.5,'s');
  const snap=(label)=>p.evaluate((label)=>{const pu=window.__inject.puppet, sc=window.__inject.scene; const scene=document.querySelector('.Scene'); return label+' '+JSON.stringify({x:Math.round(pu.x),y:Math.round(pu.y),scroll:sc.scroll_x,scripted:pu.scripted,vis:pu.tag.style.visibility,tagLeft:pu.tag.style.left,tagTop:pu.tag.style.top,sceneStyle:scene.getAttribute('style'),intro:window.__inject.hud.introShowing,cls:pu.tag.className})}, label);
  for (let k=0;k<14;k++){ console.log(await snap('t'+k)); if(k==5||k==8) await p.screenshot({path:process.argv[2]+`/n${k}.png`,clip:{x:58,y:39,width:396,height:372}}); await p.waitForTimeout(700); }
  await b.close();
})();
