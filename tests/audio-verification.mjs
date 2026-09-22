import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1000,height:800},reducedMotion:'reduce'});
const report={date:new Date().toISOString(),checks:[],errors:[],rendered:{}};page.on('pageerror',e=>report.errors.push(e.message));
function wav(samples,sampleRate){
  const data=Buffer.alloc(44+samples.length*2);data.write('RIFF');data.writeUInt32LE(data.length-8,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(sampleRate,24);data.writeUInt32LE(sampleRate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(samples.length*2,40);samples.forEach((x,i)=>data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,x))*32767),44+i*2));return data;
}
try{
 await page.goto('http://localhost:4173');await page.locator('#loading').waitFor({state:'detached'});
 assert.equal(await page.evaluate(()=>window.__BIKE_DIAGNOSTICS().audio.state),'uninitialized');report.checks.push('No autoplay before a user gesture');
 await page.locator('#start').click();await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().audio.loaded.length===10);
 await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().audio.outputRms>.005);report.checks.push('Both Gemini loops and all 8 effects render; gameplay emits measurable audio');
 await page.keyboard.press('Space');await page.keyboard.press('KeyX');await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().audio.played.jump>0&&window.__BIKE_DIAGNOSTICS().audio.played.punch>0);report.checks.push('Jump and punch trigger the Gemini effects from real keyboard input');
 await page.locator('#sound').click();await page.waitForFunction(()=>!window.__BIKE_DIAGNOSTICS().audio.enabled&&window.__BIKE_DIAGNOSTICS().audio.outputRms<.0001);report.checks.push('Mute silences the actual output bus');
 await page.locator('#sound').click();await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().audio.outputRms>.005);
 await page.locator('#pause').click();await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().audio.state==='suspended');report.checks.push('Pause suspends the audio clock');
 await page.locator('#sound').click();await page.locator('#sound').click();assert.equal(await page.evaluate(()=>window.__BIKE_DIAGNOSTICS().audio.state),'suspended');report.checks.push('Toggling sound while paused does not resume the audio clock');
 await page.locator('#resume').click();await page.waitForFunction(()=>window.__BIKE_DIAGNOSTICS().audio.state==='running'&&window.__BIKE_DIAGNOSTICS().audio.outputRms>.005);report.checks.push('Resume restores music');
 await page.locator('#pause').click();await page.locator('#quit').click();assert.equal(await page.evaluate(()=>window.__BIKE_DIAGNOSTICS().audio.musicPlaying),false);report.checks.push('Returning home stops music and old effects');
 const source=await readFile('src/audio-renderer.mjs','utf8'),score=JSON.parse(await readFile('src/gemini-score.json','utf8'));
 await page.route('**/test-audio-renderer.mjs',route=>route.fulfill({body:source,contentType:'text/javascript'}));
 const rendered=await page.evaluate(async score=>{const {renderScore}=await import('/test-audio-renderer.mjs');const buffers=await renderScore(score);return Array.from(buffers,([name,b])=>({name,sampleRate:b.sampleRate,samples:Array.from(b.getChannelData(0))}));},score);
 await mkdir('public/audio',{recursive:true});
 for(const {name,sampleRate,samples}of rendered){let peak=0,power=0;for(const x of samples){assert.ok(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));power+=x*x;}const rms=Math.sqrt(power/samples.length);assert.ok(peak>.1&&peak<.8&&rms>.001);await writeFile(`public/audio/gemini-${name}.wav`,wav(samples,sampleRate));report.rendered[name]={duration:samples.length/sampleRate,peak,rms};}
 report.checks.push('10 reproducible WAV previews exported without clipping or silent buffers');assert.deepEqual(report.errors,[]);report.passed=true;
}catch(error){report.failure=error.stack;process.exitCode=1;}
finally{await writeFile('evidence/audio-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();}
