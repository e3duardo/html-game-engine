const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{window.__inject.puppet.grow();}); await p.waitForTimeout(1500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.x=1088; pu.y=100; pu.speedX=0; pu.speedY=0;}); await p.waitForTimeout(800);
  for (let n=1;n<=3;n++){
    await p.keyboard.down('f'); const ys=[];
    for(let i=0;i<22;i++){ ys.push(Math.round(await p.evaluate(()=>window.__inject.puppet.y))); await p.waitForTimeout(25);}
    await p.keyboard.up('f'); await p.waitForTimeout(800);
    console.log('jump',n,'min y',Math.min(...ys));
  }
  await b.close();
})();
