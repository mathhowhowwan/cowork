import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.getByRole('heading',{name:'讓每一次學習，都長出力量。'}).waitFor();
await page.getByRole('button',{name:'前往數學挑戰'}).click();
for(const [i,correct] of [1,2,0,3,1].entries()){
 await page.locator('.options button').nth(correct).click();
 await page.getByText('✦ 答對了！',{exact:true}).waitFor();
 if(i<4)await page.getByRole('button',{name:'下一題'}).click();
}
await page.getByText('今日練習完成！',{exact:false}).waitFor();
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('math-territory-prototype-v1')).knowledge),10);
await page.getByRole('button',{name:'重新練習',exact:false}).click();await page.locator('.options button').nth(1).click();
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('math-territory-prototype-v1')).knowledge),10);
await page.getByRole('button',{name:'個人領地',exact:false}).click();await page.getByRole('button',{name:'升級建築',exact:false}).click();
await page.reload();await page.getByRole('heading',{name:'讓每一次學習，都長出力量。'}).waitFor();
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('math-territory-prototype-v1')).levels.farm),2);
await page.screenshot({path:'/tmp/math-territory-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/math-territory-mobile.png',fullPage:true});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
assert.deepEqual(errors,[]);
console.log('PASS: five questions, rewards, replay idempotency, upgrade, reload persistence, mobile width; no browser errors.');
}finally{await browser.close();}
