const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  const w = await p.evaluate(()=>window.__inject.scene.width);
  console.log('width', w);
  for (let x=300; x<w-40; x+=48) {
    await p.evaluate((x)=>{const pu=window.__inject.puppet; pu.x=x; pu.y=100; pu.speedX=0; pu.speedY=0;}, x);
    await p.waitForTimeout(700);
    const st = await p.evaluate(()=>{const pu=window.__inject.puppet; return {y:pu.y,g:pu.onGround,d:pu.dying}});
    if (!st.g || st.d) { console.log(x,'not on ground', JSON.stringify(st)); continue; }
    await p.keyboard.down('f');
    let min=1e9; for(let i=0;i<25;i++){ min=Math.min(min, await p.evaluate(()=>window.__inject.puppet.y)); await p.waitForTimeout(25);}
    await p.keyboard.up('f'); await p.waitForTimeout(400);
    console.log(x, 'floorY', st.y, 'rise', Math.round(st.y-min));
  }
  await b.close();
})();
