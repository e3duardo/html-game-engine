const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-1'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  const jump = async (label) => {
    await p.keyboard.down('f');
    const ys=[]; for(let i=0;i<40;i++){ ys.push(await p.evaluate(()=>Math.round(window.__inject.puppet.y))); await p.waitForTimeout(25);}
    await p.keyboard.up('f'); await p.waitForTimeout(500);
    console.log(label, ys.join(','));
  };
  await jump('1-1');
  await p.evaluate(()=>window.__inject.router.goTo('1-2'));
  await p.waitForTimeout(9000);
  console.log(await p.evaluate(()=>{const g=window.__inject.game; return JSON.stringify({ticks:g.ticks,scripted:window.__inject.puppet.scripted,x:window.__inject.puppet.x,y:window.__inject.puppet.y})}));
  await jump('1-2 after 1-1');
  const t0 = await p.evaluate(()=>window.__inject.game.ticks); await p.waitForTimeout(1000);
  console.log('ticks/s', (await p.evaluate(()=>window.__inject.game.ticks))-t0);
  await b.close();
})();
