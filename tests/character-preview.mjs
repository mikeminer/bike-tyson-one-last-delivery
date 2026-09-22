import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://localhost:4173');await page.locator('#loading').waitFor({state:'detached',timeout:60000});
 await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS?.().stats.calls>0);await page.screenshot({path:'evidence/reference-preview.png'});
 console.log(await page.evaluate(()=>({lang:document.documentElement.lang,stats:window.__BIKE_DIAGNOSTICS().stats})));
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'evidence/reference-mobile-preview.png'});assert.deepEqual(errors,[],'No shader or browser errors');
}finally{await browser.close();}
