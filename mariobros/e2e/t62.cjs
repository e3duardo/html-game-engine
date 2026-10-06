const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.shrink=()=>{}; pu.grow(false); pu.x=100*16; pu.y=150; pu.speedX=0; pu.speedY=0; pu.scripted=false;
    window.__log=[]; const g=window.__inject.game; const orig=g.gameLoop; });
  await p.waitForTimeout(1000);
  await p.keyboard.down('d'); await p.keyboard.down('ArrowRight'); await p.waitForTimeout(700);
  await p.evaluate(()=>{ window.__t=setInterval(()=>{const pu=window.__inject.puppet; window.__log.push([window.__inject.game.ticks,Math.round(pu.x),+pu.speedX.toFixed(2),pu.crouching].join(':'));},50); });
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(1800);
  console.log(await p.evaluate(()=>window.__log.join(' ')));
  await b.close();
})();
