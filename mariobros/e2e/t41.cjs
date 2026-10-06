const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-4'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  const info=()=>p.evaluate(()=>{const c=document.querySelector('item-chain'), a=document.querySelector('item-axe'); const r=(e)=>{const b=e.getBoundingClientRect(); return [Math.round(b.left),Math.round(b.top)]}; return JSON.stringify({chainVis:c.style.visibility||'visible', axeVis:a.style.visibility||'visible', chainPos:[c.offsetLeft,c.offsetTop], axePos:[a.offsetLeft,a.offsetTop], msg:document.querySelector('toad-message').style.display})});
  console.log('before', await info());
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.invincible=true; const axe=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ITEM-AXE'); pu.x=axe.x-4; pu.y=axe.y-10;});
  await p.waitForTimeout(9000);
  console.log('after', await info());
  await b.close();
})();
