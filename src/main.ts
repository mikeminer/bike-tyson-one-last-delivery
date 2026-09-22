import './style.css';
import { CityScene } from './scene';
import { createRun, step, selectReplay, sampleHistory, DURATION, FINISH, snapshot } from './simulation.mjs';
import { GameAudio } from './audio';
import { DeliveryPass, MINT } from './wallet';

const iconBike = `<svg viewBox="0 0 64 48" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="3.5"><circle cx="14" cy="33" r="11"/><circle cx="50" cy="33" r="11"/><path d="m14 33 13-23 23 23H14l10-16h17M24 8h11M43 7h7l-6 17"/></g></svg>`;
const $ = <E extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<E>(selector)!;
$('#app').innerHTML = `
<header class="topbar"><a class="brand" href="/" aria-label="Bike Tyson home">${iconBike}<span>BIKE<span class="brand-slant">TYSON</span><small>UNRELIABLE DELIVERY CO.</small></span></a>
<div class="top-actions"><button class="text-button" id="help-button">How to play <span>↗</span></button><button class="sound-button" id="sound" aria-label="Mute audio" title="Audio">♪</button><button class="pass-button" id="pass-button">Delivery Pass <span class="status-dot"></span></button></div></header>
<main class="stage" data-phase="ready"><canvas id="world" aria-label="Bike Tyson 3D city"></canvas><div class="film-grain"></div>
<section class="intro"><div class="edition"><span></span> EPISODE 01 / FREE PRACTICE</div><h1>ONE LAST<br><em>DELIVERY.</em></h1><p class="tagline">Ride. Punch. Crash. Deliver.</p><p class="intro-copy">One briefcase. 45 seconds.<br>One dangerously overconfident courier.</p><button class="play-button" id="start">ACCEPT THE DELIVERY <span>↗</span></button><div class="no-wallet">No wallet required. Just questionable decisions.</div><div class="intro-controls"><span><kbd>←</kbd><kbd>→</kbd> Steer</span><span><kbd>SPACE</kbd> Jump</span><span><kbd>X</kbd> Punch</span></div></section>
<div class="hero-stamp"><span>HANDLE WITH</span><strong>ABSOLUTELY<br>NO CARE.</strong><span>EST. FIVE MINUTES AGO</span></div>
<div class="scene-caption"><span class="small-square"></span> PASTA DISTRICT <span>41° CHAOS / 0° BRAKES</span></div>
<div class="intro-bottom"><div><span class="micro">THE JOB</span><strong>Deliver the briefcase.</strong><span>Dignity is optional.</span></div><div><span class="micro">THE REWARD</span><strong>Your worst moment.</strong><span>Automatic vertical replay.</span></div><div class="best-box"><span class="micro">YOUR LOCAL BEST</span><strong id="best">—</strong><span>Unverified · no prizes</span></div></div>
<section class="hud" aria-label="Run statistics"><div class="hud-timer"><span>TIME LEFT</span><strong id="timer">45<span>.0</span></strong></div><div class="hud-mode"><span class="live-dot"></span><b id="mode-label">PRACTICE</b><small>ONE LAST DELIVERY</small></div><div class="hud-score"><span>LAUGH ×<b id="multiplier">1.0</b></span><strong id="score">0000</strong></div></section>
<div class="run-tools"><button id="pause" aria-label="Pause">Ⅱ</button></div><div class="event-toast" id="event" aria-live="polite"></div>
<div class="run-bottom"><div class="delivery-progress"><div><span>BRIEFCASE IN TRANSIT</span><b id="distance">0 / 610 m</b></div><div class="progress-track"><i id="progress"></i></div></div><div class="dignity"><span>DIGNITY</span><div><i id="dignity"></i></div><b id="dignity-number">100%</b></div></div>
<div class="touch-controls"><div class="steer-pad"><button data-control="left" aria-label="Steer left">←</button><button data-control="right" aria-label="Steer right">→</button></div><div class="action-pad"><button data-control="jump" aria-label="Jump"><span>↑</span><small>JUMP</small></button><button data-control="punch" class="punch-button" aria-label="Bike Punch"><span>✦</span><small>PUNCH</small></button></div></div>
<section class="results" hidden><div class="result-copy"><div class="edition">YOUR BIKE TYSON MOMENT</div><h2 id="result-title">DELIVERED.<br><em>SORT OF.</em></h2><p id="result-description"></p><div class="result-stats"><div><span>LOCAL SCORE</span><strong id="result-score">0</strong></div><div><span>DISASTERS</span><strong id="result-crashes">0</strong></div><div><span>AIRTIME</span><strong id="result-air">0s</strong></div></div><p class="local-note">Saved on your device · unverified · no prizes</p><button class="play-button" id="again">ONE MORE DELIVERY <span>↗</span></button><div class="result-actions"><button id="replay-again">↻ Watch again</button><button id="home">Back to the workshop</button></div></div><div class="replay-card"><canvas id="clip" width="360" height="640" aria-label="Vertical replay of your last run"></canvas><span class="replay-badge" id="replay-badge">● REPLAY · 0.5×</span><div class="clip-actions"><button id="download" disabled>Preparing video…</button><button id="share" disabled aria-label="Share your moment">↗</button></div><p id="clip-note">8 seconds of your chaos. Your actual run.</p></div></section>
<div class="paused-overlay" hidden><div><span class="edition">A BRIEF EXISTENTIAL CRISIS</span><h2>PAUSED.</h2><p id="pause-reason">The briefcase can wait. For once.</p><button class="play-button" id="resume">RESUME <span>↗</span></button><button class="text-button" id="quit">Back to the workshop</button></div></div>
<div class="loading" id="loading"><span class="loader"></span> Inflating ego…</div>
</main><footer><span>BIKE TYSON · ONE LAST DELIVERY</span><span>POWERED BY <b>DEVFRIDGE</b></span><button id="quality">Graphics: high</button></footer>
<dialog id="help-dialog"><button class="dialog-close" aria-label="Close instructions">×</button><span class="edition">A GUIDE TO PERFECT DISASTER</span><h2>ONE<br><em>JOB.</em></h2><p>Reach the destination within 45 seconds before your dignity runs out. The bike accelerates automatically.</p><ol class="instructions"><li><b>STEER</b><span>Arrow keys / A and D, or the buttons on your phone.</span></li><li><b>JUMP</b><span>Space or ↑. Clear barriers and look for ramps.</span></li><li><b>BIKE PUNCH</b><span>X or the ✦ button. Punch nearby obstacles: hydrants launch you into the air, buses apologize.</span></li></ol><p>Near misses and punches increase your multiplier. Crashes cost dignity. Every run creates an 8-second Funny Finish.</p><p class="fineprint">Exported videos include captions, music and sound effects. Device narration is heard during playback only. Video format and sharing depend on your browser.</p><button class="play-button dialog-close-action">GOT IT. MORE OR LESS. <span>↗</span></button></dialog>
<dialog id="pass-dialog"><button class="dialog-close" aria-label="Close Delivery Pass">×</button><span class="edition">BIKE TYSON × DEVFRIDGE</span><h2>DELIVERY<br><em>PASS.</em></h2><p>Practice is always free. The pass unlocks <b>Midnight Dispatch</b>, a special delivery with the same access rule for everyone.</p><div class="policy"><strong>1,000 <small>BIKE TYSON</small></strong><span>Across one or more active locks · no minimum duration</span></div><section class="lock-onboarding" aria-labelledby="lock-heading">
<h3 id="lock-heading">PUT YOUR PASS IN THE FRIDGE.</h3>
<p>Lock at least <b>1,000 BIKE TYSON</b> in total on Solana using the same Phantom wallet you connect here. Choose your unlock date in DevFridge.</p>
<div class="mint-row"><code id="pass-mint">${MINT}</code><button class="text-button" id="copy-pass-mint" aria-label="Copy BIKE TYSON mint address">Copy CA</button></div>
<p class="lock-costs">No early withdrawals. Redeeming after expiry carries a <b>2% fee</b> for PASTA buy &amp; burn, plus network costs. Redemption also needs an available Jupiter swap route; it may remain unavailable after expiry.</p>
<a class="play-button lock-link" id="lock-devfridge" href="https://devfridge.cool/?mint=${MINT}#fridge" target="_blank" rel="noopener noreferrer">LOCK ON DEVFRIDGE <span>↗</span></a>
<div class="lock-links"><a href="https://pump.fun/coin/${MINT}" target="_blank" rel="noopener noreferrer">Buy BIKE TYSON ↗</a><a id="lock-phantom" href="https://phantom.app/ul/browse/${encodeURIComponent(`https://devfridge.cool/?mint=${MINT}#fridge`)}?ref=${encodeURIComponent(location.origin)}" target="_blank" rel="noopener noreferrer">Lock in Phantom mobile ↗</a></div>
<p class="fineprint">DevFridge opens with BIKE TYSON preselected. Confirm your lock there, then return here and sign in or select <b>Recheck locks</b>. Access unlocks only after your active locks are verified.</p>
</section><div class="wallet-status"><span id="wallet-address">Wallet not connected</span><p id="wallet-status" aria-live="polite"></p></div><div class="wallet-buttons"><button class="play-button" id="connect">CONNECT PHANTOM <span>↗</span></button><button class="play-button" id="authenticate" hidden>SIGN IN & VERIFY <span>↗</span></button><button class="text-button" id="recheck" hidden>Recheck locks</button><button class="text-button" id="disconnect" hidden>Disconnect</button><button class="play-button" id="special" hidden>PLAY MIDNIGHT DISPATCH <span>↗</span></button><a id="phantom-link" class="text-link" hidden>Open in Phantom browser ↗</a></div><details><summary>Rules, expiry and costs</summary><p>Locks for the same mint are added together. You need at least 1,000 tokens still locked (1,000,000,000 base units). Expired locks stop counting. If access expires during a run, that run continues in practice mode. Your local records remain.</p><p><b>No early withdrawals.</b> After expiry, DevFridge redemption uses <b>2% of redeemed tokens</b> to buy and burn PASTA; network costs are separate. The game adds no second fee.</p><p><b>Expiry does not guarantee immediate redemption:</b> tokens other than PASTA require an executable Jupiter route. The game does not guarantee a redemption route for this mint. Create and redeem locks through the official DevFridge site.</p><p>The pass reads the existing DevFridge program. Connection, sign-in, token eligibility and score verification are separate operations. These runs offer no prizes and do not record scores on-chain.</p><code>${MINT}</code><p>Solana mainnet · Token-2022 · 6 decimals. Mint data observed on September 22, 2026 and rechecked by the server at sign-in.</p><a href="https://scan.devfridge.cool/t/${MINT}" target="_blank" rel="noopener noreferrer">View mint on DevFridge Scan ↗</a></details><p class="fineprint">Sign-in uses a message signature, not a transaction. We never ask for seed phrases or private keys.</p></dialog>`;

const stage=$('.stage'),world=$<HTMLCanvasElement>('#world'),clip=$<HTMLCanvasElement>('#clip'),clipCtx=clip.getContext('2d')!;
const audio=new GameAudio();let run=createRun(111),phase='ready',pausedPhase='playing',city:CityScene;
let last=0,accumulator=0,clock=0,toastUntil=0,replayClock=0,lastReplayT=0,replay=selectReplay(run),lowQuality=false;
let best=0;try{best=Number(localStorage.getItem('bike-tyson-best-v1'))||0;}catch{}
$('#best').textContent=best?best.toLocaleString('en-US'):'NO DISASTERS. YET.';
let recorder:MediaRecorder|null=null,recordingStream:MediaStream|null=null,clipBlob:Blob|null=null,clipUrl='',captureId=0,replayComplete=false;
const held=new Set<string>(),queued=new Set<string>();const input={steer:0,jump:false,punch:false};
function clearInput(){held.clear();queued.clear();input.steer=0;input.jump=false;input.punch=false;}
function updateInput(){input.steer=(held.has('right')?1:0)-(held.has('left')?1:0);input.jump=held.has('jump');input.punch=held.has('punch');}
const pass=new DeliveryPass(updatePass);
function updatePass(){
  $('#wallet-status').textContent=pass.message;$('#wallet-address').textContent=pass.wallet?`${pass.wallet.slice(0,6)}…${pass.wallet.slice(-6)} · ${pass.authenticated?'identity verified':'connected only'}`:'Wallet not connected';
  $<HTMLButtonElement>('#connect').hidden=!!pass.wallet;$<HTMLButtonElement>('#connect').disabled=pass.busy;
  $<HTMLButtonElement>('#authenticate').hidden=!pass.wallet||pass.authenticated;$<HTMLButtonElement>('#authenticate').disabled=pass.busy;
  $('#recheck').hidden=!pass.authenticated;$<HTMLButtonElement>('#recheck').disabled=pass.busy;$('#disconnect').hidden=!pass.wallet;$('#special').hidden=!pass.eligible;
  $('.status-dot').classList.toggle('active',pass.eligible);
  if(run.special&&!pass.eligible){run.special=false;$('#mode-label').textContent='PRACTICE';toast('PASS EXPIRED OR UNAVAILABLE · CONTINUING IN PRACTICE');}
}
$('#copy-pass-mint').onclick=async()=>{const button=$('#copy-pass-mint');try{await navigator.clipboard.writeText(MINT);button.textContent='Copied';}catch{button.textContent='Select CA above';}window.setTimeout(()=>{button.textContent='Copy CA'},2500);};
$('#connect').onclick=()=>void pass.connect();$('#authenticate').onclick=()=>void pass.authenticate();$('#recheck').onclick=()=>void pass.check();$('#disconnect').onclick=()=>void pass.disconnect();
if(location.protocol==='https:'){const link=$<HTMLAnchorElement>('#phantom-link');link.href=`https://phantom.app/ul/browse/${encodeURIComponent(location.origin+location.pathname)}?ref=${encodeURIComponent(location.origin)}`;link.hidden=false;}
updatePass();
function toast(message:string){$('#event').textContent=message;$('#event').classList.add('show');toastUntil=clock+2.5;}
function setPhase(value:string){phase=value;audio.setScene(value);stage.dataset.phase=value;$('.results').hidden=!['replay','result'].includes(value);$('.paused-overlay').hidden=value!=='paused';}
function pause(reason?:string){if(!['playing','replay'].includes(phase))return;pausedPhase=phase;setPhase('paused');clearInput();audio.pause();if(recorder?.state==='recording')recorder.pause();$('#pause-reason').textContent=reason||'The briefcase can wait. For once.';}
async function resume(){if(phase!=='paused')return;await audio.start().catch(()=>{});last=performance.now();accumulator=0;if(recorder?.state==='paused')recorder.resume();setPhase(pausedPhase);}
function openDialog(id:string){pause();clearInput();$<HTMLDialogElement>(id).showModal();}
$('#help-button').onclick=()=>openDialog('#help-dialog');$('#pass-button').onclick=()=>openDialog('#pass-dialog');
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog=>{dialog.querySelectorAll<HTMLElement>('.dialog-close,.dialog-close-action').forEach(button=>button.onclick=()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
function stopRecording(discard=false){if(discard)captureId++;if(recorder&&recorder.state!=='inactive')recorder.stop();recorder=null;if(discard){recordingStream?.getTracks().forEach(t=>t.stop());recordingStream=null;}}
function home(){stopRecording(true);clearInput();audio.pause();run=createRun(111);city.setRun(run.obstacles);setPhase('ready');$('#event').classList.remove('show');}
async function start(special=false){
  if(!city||special&&!pass.eligible)return;
  stopRecording(true);clearInput();run=createRun(special?Math.floor(Date.now()/86400000):Date.now(),special);city.setRun(run.obstacles);
  await audio.start().catch(()=>{});$('#mode-label').textContent=special?'MIDNIGHT DISPATCH':'PRACTICE';
  stage.classList.toggle('special-run',special);setPhase('playing');last=performance.now();accumulator=0;toast('DELIVER THE BRIEFCASE. DIGNITY IS OPTIONAL.');
}
$('#start').onclick=()=>void start();$('#again').onclick=()=>void start(run.special&&pass.eligible);$('#special').onclick=()=>{$<HTMLDialogElement>('#pass-dialog').close();void start(true);};
$('#home').onclick=home;$('#quit').onclick=home;$('#pause').onclick=()=>pause();$('#resume').onclick=()=>void resume();
$('#sound').onclick=()=>{audio.toggle();$('#sound').textContent=audio.enabled?'♪':'♪̸';$('#sound').setAttribute('aria-label',audio.enabled?'Mute audio':'Enable audio');if(audio.enabled&&phase!=='paused')void audio.start();};
$('#quality').onclick=()=>{lowQuality=!lowQuality;city.quality(lowQuality);$('#quality').textContent=`Graphics: ${lowQuality?'low':'high'}`;};
const keys:Record<string,string>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'punch'};
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.code==='Escape'||e.code==='KeyP'){if(phase==='paused')void resume();else pause();return;}if(phase!=='playing'||!keys[e.code])return;e.preventDefault();held.add(keys[e.code]);if(!e.repeat)queued.add(keys[e.code]);updateInput();});
addEventListener('keyup',e=>{if(keys[e.code]){held.delete(keys[e.code]);updateInput();}});
document.querySelectorAll<HTMLButtonElement>('[data-control]').forEach(button=>{const action=button.dataset.control!;button.addEventListener('pointerdown',e=>{if(phase!=='playing')return;e.preventDefault();button.setPointerCapture(e.pointerId);held.add(action);queued.add(action);button.classList.add('pressed');updateInput();});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{held.delete(action);button.classList.remove('pressed');updateInput();});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Your run paused while you were away. Press resume when you are ready.');});
addEventListener('blur',()=>{clearInput();pause();});
world.addEventListener('webglcontextlost',e=>{e.preventDefault();pause('Graphics temporarily unavailable. Waiting for the graphics context to recover.');$<HTMLButtonElement>('#resume').disabled=true;});
world.addEventListener('webglcontextrestored',()=>{$<HTMLButtonElement>('#resume').disabled=false;$('#pause-reason').textContent='Graphics restored. You can resume.';});
function updateHUD(){const time=Math.max(0,DURATION-run.t);$('#timer').innerHTML=`${Math.floor(time).toString().padStart(2,'0')}<span>.${Math.floor(time%1*10)}</span>`;$('#score').textContent=Math.floor(run.score).toString().padStart(4,'0');$('#multiplier').textContent=run.multiplier.toFixed(1);$('#distance').textContent=`${Math.min(FINISH,Math.floor(run.distance))} / ${FINISH} m`;$('#progress').style.width=`${Math.min(100,run.distance/FINISH*100)}%`;$('#dignity').style.width=`${run.dignity}%`;$('#dignity-number').textContent=`${run.dignity}%`;}
function result(){
  clearInput();$('#result-title').innerHTML=run.delivered?'DELIVERED.<br><em>ALLEGEDLY.</em>':'ARRIVED.<br><em>DIFFERENTLY.</em>';
  $('#result-description').textContent=run.delivered?'The briefcase arrived. Nobody wants to know how.':run.dignity<=0?'Dignity has left the delivery. The bike demands another attempt.':'Time is up. The recipient is still staring out of the window.';
  $('#result-score').textContent=Math.floor(run.score).toLocaleString('en-US');$('#result-crashes').textContent=String(run.crashes);$('#result-air').textContent=`${run.air.toFixed(1)}s`;
  if(run.score>best){best=Math.floor(run.score);try{localStorage.setItem('bike-tyson-best-v1',String(best));}catch{}$('#best').textContent=best.toLocaleString('en-US');}
  beginReplay();
}
function beginReplay(){
  stopRecording(true);replay=selectReplay(run);replayClock=0;lastReplayT=replay.start-.01;replayComplete=false;clipBlob=null;if(clipUrl){URL.revokeObjectURL(clipUrl);clipUrl='';}
  $('#download').textContent='Preparing video…';$<HTMLButtonElement>('#download').disabled=true;$<HTMLButtonElement>('#share').disabled=true;$('#replay-badge').textContent='● REPLAY · 0.5×';
  $('#clip-note').textContent='8 seconds of your chaos. Music, captions and sound effects included.';
  setPhase('replay');audio.react(run.delivered?'finish':'crash');audio.narrate(replay.caption);const id=++captureId;
  if(typeof MediaRecorder==='undefined'||!clip.captureStream){$('#clip-note').textContent='Video is not supported here. You can save a still frame.';return;}
  const type=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type)return;
  try {
    recordingStream=clip.captureStream(30);audio.destination?.stream.getAudioTracks().forEach(t=>recordingStream!.addTrack(t.clone()));
    const stream=recordingStream,parts:BlobPart[]=[];recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2200000});
    recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};
    recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(id!==captureId)return;clipBlob=new Blob(parts,{type});clipUrl=URL.createObjectURL(clipBlob);$('#download').textContent='DOWNLOAD YOUR MOMENT ↓';$<HTMLButtonElement>('#download').disabled=false;$<HTMLButtonElement>('#share').disabled=false;};
    recorder.onerror=()=>{if(id===captureId){$('#clip-note').textContent='Recording failed. Watch the replay again or save a still frame.';clipBlob=null;}};
    recorder.start();
  }catch{recordingStream?.getTracks().forEach(t=>t.stop());recorder=null;$('#clip-note').textContent='Recording unavailable. You can save a still frame.';}
}
function drawClip(){
  const width=world.width,height=world.height;clipCtx.fillStyle='#163a37';clipCtx.fillRect(0,0,360,640);
  // Crop the actual rendered replay; no fabricated footage or fresh simulation.
  const cropH=height,cropW=Math.min(width,height*360/525);clipCtx.drawImage(world,(width-cropW)/2,0,cropW,cropH,0,65,360,525);
  clipCtx.fillStyle='#e6ed43';clipCtx.fillRect(0,0,360,65);clipCtx.fillStyle='#163a37';clipCtx.textAlign='center';clipCtx.font='900 26px Arial';clipCtx.fillText('BIKE TYSON',180,31);clipCtx.font='bold 10px Arial';clipCtx.fillText('YOUR BIKE TYSON MOMENT',180,50);
  clipCtx.fillStyle='rgba(20,45,40,.87)';clipCtx.fillRect(12,440,336,120);clipCtx.fillStyle='#f4efdc';clipCtx.font='900 22px Arial';
  const words=replay.caption.split(' ');let lines:string[]=[],line='';for(const word of words){const next=line?line+' '+word:word;if(clipCtx.measureText(next).width>304){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  lines.forEach((text,i)=>clipCtx.fillText(text,180,470+i*26));clipCtx.fillStyle='#f4efdc';clipCtx.font='bold 11px Arial';clipCtx.fillText('ONE LAST DELIVERY  /  RIDE. PUNCH. CRASH.',180,612);clipCtx.font='10px Arial';clipCtx.fillText(run.special?'DELIVERY PASS · LOCAL SCORE':'PRACTICE MODE · LOCAL SCORE',180,630);
}
$('#replay-again').onclick=()=>{void audio.start();beginReplay();};
$('#download').onclick=()=>{const anchor=document.createElement('a');anchor.href=clipUrl||clip.toDataURL('image/png');anchor.download=clipBlob?`bike-tyson-moment.${clipBlob.type.includes('mp4')?'mp4':'webm'}`:'bike-tyson-moment.png';anchor.click();};
$('#share').onclick=async()=>{if(!clipBlob)return;const file=new File([clipBlob],`bike-tyson-moment.${clipBlob.type.includes('mp4')?'mp4':'webm'}`,{type:clipBlob.type});try{if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'Your Bike Tyson Moment',text:'Ride. Punch. Crash. Deliver.'});else{$('#clip-note').textContent='Download the video and attach it to your post: this browser cannot share files.';}}catch(error){$('#clip-note').textContent=error instanceof Error&&error.name==='AbortError'?'Sharing canceled. Your video is still here.':'Sharing failed. You can download the video.';}};
function animate(now:number){
  requestAnimationFrame(animate);const delta=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
  if(document.hidden)return;clock+=delta;if(clock>toastUntil)$('#event').classList.remove('show');
  if(phase==='playing'){
    if(run.special&&!pass.eligible)updatePass();accumulator+=delta;
    while(accumulator>=1/60){input.jump=held.has('jump')||queued.has('jump');input.punch=held.has('punch')||queued.has('punch');const events=step(run,input,1/60);queued.clear();accumulator-=1/60;for(const e of events){audio.react(e.kind);if(e.caption)toast(e.caption);}if(run.done){result();break;}}
    updateHUD();
  }
  if(phase==='replay'){
    replayClock+=delta;const replayT=replay.start+(replay.end-replay.start)*Math.min(1,replayClock/8);const frame=sampleHistory(run.history,replayT);if(frame)city.render(frame,run.obstacles,'replay',replayClock);
    for(const event of run.events as Array<{t:number;kind:string}>){if(event.t>lastReplayT&&event.t<=replayT)audio.react(event.kind);}lastReplayT=replayT;
    drawClip();if(replayClock>=8){replayComplete=true;setPhase('result');$('#replay-badge').textContent='YOUR MOMENT · 8 SEC';stopRecording();if(!recorder&&!clipBlob){$('#download').textContent='DOWNLOAD STILL FRAME ↓';$<HTMLButtonElement>('#download').disabled=false;}}
  }else if(phase==='playing'||phase==='ready'&&(!city.reduced||city.needsFrame))city.render(snapshot(run),run.obstacles,phase,clock);
}
async function boot(){try{city=new CityScene(world);city.setRun(run.obstacles);await city.bike.ready;$('#loading').remove();requestAnimationFrame(animate);}
catch(error){$('#loading').innerHTML=city?'<strong>Character texture could not load.</strong><p>Reload the page to try again.</p>':'<strong>This city requires WebGL 2.</strong><p>Enable hardware acceleration or try an updated browser.</p>';console.error(error);$<HTMLButtonElement>('#start').disabled=true;}}
void boot();
Object.defineProperty(window,'__BIKE_DIAGNOSTICS',{value:()=>({phase,run:snapshot(run),done:run.done,delivered:run.delivered,stats:city?.stats,audio:audio.diagnostics,recording:recorder?.state??null,replayComplete,clipBytes:clipBlob?.size??0,passEligible:pass.eligible})});
