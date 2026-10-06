const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{window.__inject.puppet.grow();}); await p.waitForTimeout(1500);
  for (let x=300; x<1500; x+=8) {
    await p.evaluate((x)=>{const pu=window.__inject.puppet; pu.x=x; pu.y=100; pu.speedX=0; pu.speedY=0;}, x);
    await p.waitForTimeout(500);
    const st = await p.evaluate(()=>{const pu=window.__inject.puppet; return {y:pu.y,g:pu.onGround,d:pu.dying,h:pu.height}});
    if (!st.g) continue;
    await p.keyboard.down('f');
    let min=1e9, ys=[]; for(let i=0;i<14;i++){ const y=await p.evaluate(()=>window.__inject.puppet.y); ys.push(Math.round(y)); await p.waitForTimeout(25);}
    await p.keyboard.up('f'); await p.waitForTimeout(500);
    const rise = st.y-Math.min(...ys);
    // flag stuck: still near the floor after 14 samples (350ms)
    if (ys[ys.length-1] >= st.y-8) console.log(x,'STUCK? floorY',st.y,'h',st.h, ys.join(','));
  }
  await b.close();
})();
