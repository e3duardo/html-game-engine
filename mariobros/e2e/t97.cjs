const { chromium, url } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 512, height: 480 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url('1-2'));
  await p.waitForTimeout(1500); await p.keyboard.press('Enter'); await p.waitForTimeout(9000);
  const lifts=()=>p.evaluate(()=>window.__inject.scene.collisionMap.filter(o=>o.tag.tagName==='SCENARIO-ELEVATOR').map(o=>Math.round(o.bottomPos)));
  console.log('far (should be at start)', JSON.stringify(await lifts()));
  await p.evaluate(()=>{const pu=window.__inject.puppet; pu.die=()=>{}; pu.x=162*16; pu.y=100;});
  let prev=await lifts(); const log=[]; let maxJump=0;
  for (let i=0;i<60;i++){ await p.waitForTimeout(100); const cur=await lifts(); cur.forEach((v,k)=>{ const d=Math.abs(v-prev[k]); if(d>maxJump) maxJump=d; if (d>50) log.push(`lift${k} ${prev[k]} -> ${v}`);}); prev=cur; }
  console.log('after 12s', JSON.stringify(prev), 'max step', maxJump, 'wraps:', log.join(' | '));
  // riding: wait for the 3rd lift (up) to be around mid screen, then drop mario on it
  for (let i=0;i<200;i++){ const v=(await lifts())[2]; if (v>60 && v<120) break; await p.waitForTimeout(100); }
  await p.evaluate(()=>{const I=window.__inject; const l=I.scene.collisionMap.filter(o=>o.tag.tagName==='SCENARIO-ELEVATOR')[2]; I.puppet.x=l.tag.offsetLeft+16; I.puppet.y=240-l.bottomPos-16-16-6; I.puppet.speedY=0;});
  const ys=[]; for(let i=0;i<10;i++){ await p.waitForTimeout(150); ys.push(await p.evaluate(()=>{const I=window.__inject; const l=I.scene.collisionMap.filter(o=>o.tag.tagName==='SCENARIO-ELEVATOR')[2]; return Math.round(I.puppet.y+16-(240-l.bottomPos-16))+(I.puppet.onGround?'g':'')})); }
  console.log('riding feet-liftTop', ys.join(' '));
  await b.close();
})();
