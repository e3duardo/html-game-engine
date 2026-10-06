const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter');
  await p.waitForTimeout(3600);
  for (let i=0;i<6;i++){ await p.screenshot({path:process.argv[2]+`/c${i}.png`, clip:{x:0,y:90,width:512,height:330}}); console.log(i, await p.evaluate(()=>JSON.stringify({x:window.__inject.puppet.x,y:window.__inject.puppet.y,scroll:window.__inject.scene.scroll_x}))); await p.waitForTimeout(800); }
  await b.close();
})();
