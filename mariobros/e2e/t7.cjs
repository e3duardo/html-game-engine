const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  await p.evaluate(()=>{window.__inject.puppet.grow();}); await p.waitForTimeout(1500);
  for (const x of [1052,1068,1076,1084,1092,1100,1108]) {
    await p.evaluate((x)=>{const pu=window.__inject.puppet; pu.x=x; pu.y=100; pu.speedX=0; pu.speedY=0;}, x);
    await p.waitForTimeout(600);
    const r = await p.evaluate(()=>{
      const pu=window.__inject.puppet; const out=[];
      // probe: mario raised 12px
      const probe={ax:pu.x, ay:pu.y-18, width:pu.width, height:pu.height};
      window.__inject.scene.collisionMap.forEach(o=>{ const c=o.collides(probe); if(c.top||c.bottom||c.left||c.right) out.push(o.tag.tagName+' x'+o.x+' y'+o.y+' w'+o.width+' h'+o.height+' '+Object.keys(c).filter(k=>c[k]).join('/')+(o.dead?' DEAD':'')); });
      return {x:pu.x,y:pu.y,w:pu.width,out};
    });
    console.log(x, JSON.stringify(r));
  }
  await b.close();
})();
