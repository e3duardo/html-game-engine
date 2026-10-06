const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => m.type()==='error' && console.log('CERR', m.text()));
  await p.goto(url());
  await p.waitForTimeout(1500);
  await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  for (let i=0;i<3;i++){ await p.screenshot({path: process.argv[2]+`/s${i}.png`}); await p.waitForTimeout(700); }
  console.log(await p.evaluate(()=>[...document.querySelectorAll('enemy-fire-bar,enemy-koopa-fire')].map(e=>e.tagName+' '+e.style.left+' '+e.children.length)));
  await b.close();
})();
