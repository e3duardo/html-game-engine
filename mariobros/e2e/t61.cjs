const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.shrink=()=>{}; pu.grow(false); pu.x=63*16; pu.y=150; pu.speedX=0; pu.speedY=0; pu.scripted=false;});
  await p.waitForTimeout(1000);
  const st=()=>p.evaluate(()=>{const pu=window.__inject.puppet; return JSON.stringify({x:Math.round(pu.x),y:Math.round(pu.y),h:pu.height,v:+pu.speedX.toFixed(2),crouch:pu.crouching,cls:pu.tag.className.replace(/Collidable/,'').trim()})});
  console.log('start', await st());
  await p.keyboard.down('d'); await p.keyboard.down('ArrowRight');
  await p.waitForTimeout(550);
  console.log('running', await st());
  await p.keyboard.down('ArrowDown');
  for (let i=0;i<14;i++){ await p.waitForTimeout(150); console.log('slide', await st()); }
  await p.keyboard.up('ArrowDown'); await p.keyboard.up('ArrowRight'); await p.keyboard.up('d');
  await p.waitForTimeout(800);
  console.log('after', await st());
  await b.close();
})();
