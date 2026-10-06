const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url('1-4'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(4000);
  console.log('scene width', await p.evaluate(()=>window.__inject.scene.width));
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.grow(); pu.x=130*16; pu.y=100;});
  await p.waitForTimeout(1500);
  let seen=new Map();
  for (let i=0;i<150;i++){ // 15s
    const fl = await p.evaluate(()=>[...document.querySelectorAll('enemy-koopa-fire')].map(e=>[e.style.left,e.style.top]));
    if (fl.length) seen.set(JSON.stringify(fl[0].slice(1)), 1);
    if (i%25==0) console.log(i, JSON.stringify(fl), await p.evaluate(()=>window.__inject.puppet.dying));
    await p.waitForTimeout(100);
  }
  console.log('spawn tops seen', [...seen.keys()].join(' '));
  await b.close();
})();
