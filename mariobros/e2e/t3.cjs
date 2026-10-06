const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  for (const route of ['1-1','1-2']) {
    const p = await b.newPage({ viewport: { width: 512, height: 480 } });
    p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(url(route));
    await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
    const r = await p.evaluate(async () => {
      const pu = window.__inject.puppet;
      const info = {x:pu.x,y:pu.y,onGround:pu.onGround,scripted:pu.scripted,grav:window.__inject.scene.gravity, jp: pu._jumpPhysics};
      return info;
    });
    console.log(route, JSON.stringify(r));
    await p.keyboard.down('f');
    const ys=[]; for(let i=0;i<40;i++){ ys.push(await p.evaluate(()=>Math.round(window.__inject.puppet.y))); await p.waitForTimeout(25);}
    await p.keyboard.up('f');
    console.log(route, ys.join(','));
    await p.close();
  }
  await b.close();
})();
