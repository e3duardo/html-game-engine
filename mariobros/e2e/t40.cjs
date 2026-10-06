const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  console.log(await p.evaluate(()=>{
    const pl=window.__inject.scene.collisionMap.find(o=>o.tag.tagName==='ENEMY-PIRANHA-PLANT');
    pl._offset=24; const top=pl.y, x=pl.x; const out=['plant x '+x+' top '+top];
    const t=(label,ax,ay,h,crouch)=>out.push(label+': '+pl.touches({ax,ay,height:h,crouching:crouch}));
    t('small standing on pipe mouth', x, top+16, 16);
    t('small beside (16px left)', x-16, top+16, 16);
    t('small beside (11px left, edge)', x-11, top+16, 16);
    t('small above head 8px', x, top-8, 16);
    t('big standing on pipe', x, top, 32);
    t('big beside 14px', x-14, top, 32);
    pl._offset=0; t('retracted, small on pipe', x, top+16, 16);
    return out.join('\n');
  }));
  await b.close();
})();
