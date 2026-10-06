const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url('1-4'));
  await p.addStyleTag({content:'touch-controls{display:none!important}'});
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=2400; pu.y=100;}); await p.waitForTimeout(1500);
  await p.screenshot({path:process.argv[2]+'/toad.png', clip:{x:58,y:39,width:396,height:372}});
  await b.close();
})();
