const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 }, deviceScaleFactor: 3 });
  await p.goto(url('1-3'));
  await p.addStyleTag({content:'touch-controls{display:none!important}'});
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.x=70*16; pu.y=100;});
  await p.waitForTimeout(2500);
  const r = await p.evaluate(()=>{const e=document.querySelector('enemy-para-troopa:nth-of-type(1)'); const els=[...document.querySelectorAll('enemy-para-troopa')]; const out=els.map(e=>{const b=e.getBoundingClientRect(); return [b.left,b.top,b.width,b.height, e.className]}); return out});
  console.log(JSON.stringify(r));
  const [l,t,w,h] = r[0];
  for (let i=0;i<3;i++){ await p.screenshot({path:process.argv[2]+`/para${i}.png`, clip:{x:Math.max(0,l-20),y:Math.max(0,t-20),width:w+40,height:h+40}}); await p.waitForTimeout(260); }
  await b.close();
})();
