const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter');
  for (const t of [3500, 3000, 3000]) { await p.waitForTimeout(t); console.log(await p.evaluate(()=>JSON.stringify({x:window.__inject.puppet.x,y:window.__inject.puppet.y,scroll:window.__inject.scene.scroll_x,scripted:window.__inject.puppet.scripted}))); }
  
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=700; pu.y=300;});
  for (let i=0;i<8;i++){ await p.waitForTimeout(1500); console.log('after death', i, await p.evaluate(()=>JSON.stringify({x:window.__inject.puppet.x,y:window.__inject.puppet.y,scroll:window.__inject.scene.scroll_x,dying:window.__inject.puppet.dying,lives:window.__inject.puppet.lives}))); }
  await b.close();
})();
