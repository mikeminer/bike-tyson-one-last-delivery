import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://localhost:4173')&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))external.push(r.url());});
const report={date:new Date().toISOString(),production:true,errors,externalRequests:external,textureCounts:[]};
try{
  await page.goto('http://localhost:4173');await page.locator('#loading').waitFor({state:'detached'});await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().stats.calls>0);
  assert.equal(await page.locator('script[src*="@vite"]').count(),0);report.productionLoads=true;
  for(let i=0;i<4;i++){await page.locator('#start').click();await page.waitForTimeout(300);await page.locator('#pause').click();await page.locator('#quit').click();await page.waitForTimeout(200);report.textureCounts.push(await page.evaluate(()=>window.__BIKE_DIAGNOSTICS().stats.textures));}
  assert.ok(Math.max(...report.textureCounts)-Math.min(...report.textureCounts)<5);report.repeatRunResourcesBounded=true;
  const bytes=await readFile('evidence/funny-finish-demo.webm');await page.route('**/test-recording.webm',r=>r.fulfill({body:bytes,contentType:'video/webm'}));
  report.exportedAudio=await page.evaluate(async()=>{const ctx=new OfflineAudioContext(1,24000,24000);const b=await ctx.decodeAudioData(await(await fetch('/test-recording.webm')).arrayBuffer());let energy=0,peak=0,count=0;for(let c=0;c<b.numberOfChannels;c++)for(const sample of b.getChannelData(c)){energy+=sample*sample;peak=Math.max(peak,Math.abs(sample));count++;}return{duration:b.duration,channels:b.numberOfChannels,rms:Math.sqrt(energy/count),peak};});
  assert.ok(report.exportedAudio.rms>.001);assert.ok(report.exportedAudio.peak<=1);report.exportContainsAudibleTrack=true;
  await page.evaluate(()=>{const v=document.createElement('video');v.id='export-test';v.src='/test-recording.webm';v.muted=true;v.style.cssText='position:fixed;right:20px;top:100px;height:640px;z-index:100;background:#183a35';document.body.appendChild(v);v.play();});
  await page.waitForFunction(()=>document.querySelector('#export-test').currentTime>1,{},{timeout:15000});
  report.recording=await page.evaluate(()=>{const v=document.querySelector('#export-test');return{width:v.videoWidth,height:v.videoHeight,duration:v.duration,currentTime:v.currentTime,decodedFrames:v.getVideoPlaybackQuality().totalVideoFrames};});
  assert.equal(report.recording.width,360);assert.equal(report.recording.height,640);assert.ok(report.recording.decodedFrames>10);
  await page.screenshot({path:'evidence/export-playback.png'});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);report.passed=true;
}catch(error){report.failure=error.stack;process.exitCode=1;}
finally{await writeFile('evidence/production-smoke.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
