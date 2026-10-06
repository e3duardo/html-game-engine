const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url('1-3'));
  await p.addStyleTag({content:'touch-controls{display:none!important}'});
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(3500);
  console.log(await p.evaluate(()=>[...document.querySelectorAll('building-castle')].map(c=>{const f=c.querySelector('.star-flag'); const cs=getComputedStyle(f); return JSON.stringify({size:c.size,x:c.x,y:c.y,tagLeft:c.style.left,tagBottom:c.style.bottom,tagH:c.style.height,flagLeft:cs.left,flagBottom:cs.bottom,flagZ:cs.zIndex})}).join('\n')));
  await p.screenshot({path:process.argv[2]+'/c13.png', clip:{x:58,y:39,width:396,height:372}});
  await b.close();
})();
