const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url('1-4'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.x=104*16+8; pu.y=100; pu.speedX=0;});
  await p.waitForTimeout(600);
  await p.keyboard.down('ArrowRight'); await p.keyboard.down('d'); await p.waitForTimeout(650);
  console.log('running', await p.evaluate(()=>JSON.stringify({x:window.__inject.puppet.x,y:window.__inject.puppet.y,v:window.__inject.puppet.speedX,sc:window.__inject.puppet.scripted,win:window.__inject.puppet.winning,fz:window.__inject.game.worldFrozen,paused:window.__inject.game.paused,ticks:window.__inject.game.ticks})));
  await p.keyboard.up('d'); const v=[]; for (let i=0;i<8;i++){ v.push(await p.evaluate(()=>+window.__inject.puppet.speedX.toFixed(2))); await p.waitForTimeout(25);} console.log('after releasing B', v.join(' '));
  await b.close();
})();
