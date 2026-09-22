import './style.css';
import { CityScene } from './scene';
import { createRun, step, selectReplay, sampleHistory, DURATION, FINISH, snapshot } from './simulation.mjs';
import { GameAudio } from './audio';
import { DeliveryPass, MINT } from './wallet';

const iconBike = `<svg viewBox="0 0 64 48" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="3.5"><circle cx="14" cy="33" r="11"/><circle cx="50" cy="33" r="11"/><path d="m14 33 13-23 23 23H14l10-16h17M24 8h11M43 7h7l-6 17"/></g></svg>`;
const $ = <E extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<E>(selector)!;
$('#app').innerHTML = `
<header class="topbar"><a class="brand" href="/" aria-label="Bike Tyson home">${iconBike}<span>BIKE<span class="brand-slant">TYSON</span><small>UNRELIABLE DELIVERY CO.</small></span></a>
<div class="top-actions"><button class="text-button" id="help-button">Come si gioca <span>↗</span></button><button class="sound-button" id="sound" aria-label="Disattiva audio" title="Audio">♪</button><button class="pass-button" id="pass-button">Delivery Pass <span class="status-dot"></span></button></div></header>
<main class="stage" data-phase="ready"><canvas id="world" aria-label="Città 3D di Bike Tyson"></canvas><div class="film-grain"></div>
<section class="intro"><div class="edition"><span></span> EPISODIO 01 / PRATICA GRATUITA</div><h1>ONE LAST<br><em>DELIVERY.</em></h1><p class="tagline">Ride. Punch. Crash. Deliver.</p><p class="intro-copy">Una valigetta. 45 secondi.<br>Un corriere decisamente troppo sicuro di sé.</p><button class="play-button" id="start">ACCETTA LA CONSEGNA <span>↗</span></button><div class="no-wallet">Nessun wallet necessario. Solo pessime decisioni.</div><div class="intro-controls"><span><kbd>←</kbd><kbd>→</kbd> Sterza</span><span><kbd>SPACE</kbd> Salta</span><span><kbd>X</kbd> Pugno</span></div></section>
<div class="hero-stamp"><span>HANDLE WITH</span><strong>ABSOLUTELY<br>NO CARE.</strong><span>EST. FIVE MINUTES AGO</span></div>
<div class="scene-caption"><span class="small-square"></span> PASTA DISTRICT <span>41° CHAOS / 0° BRAKES</span></div>
<div class="intro-bottom"><div><span class="micro">IL LAVORO</span><strong>Consegna la valigetta.</strong><span>La dignità è facoltativa.</span></div><div><span class="micro">LA RICOMPENSA</span><strong>Il tuo momento peggiore.</strong><span>Replay verticale automatico.</span></div><div class="best-box"><span class="micro">IL TUO RECORD LOCALE</span><strong id="best">—</strong><span>Non verificato · nessun premio</span></div></div>
<section class="hud" aria-label="Dati della corsa"><div class="hud-timer"><span>TEMPO RIMASTO</span><strong id="timer">45<span>.0</span></strong></div><div class="hud-mode"><span class="live-dot"></span><b id="mode-label">PRATICA</b><small>ONE LAST DELIVERY</small></div><div class="hud-score"><span>RISATA ×<b id="multiplier">1.0</b></span><strong id="score">0000</strong></div></section>
<div class="run-tools"><button id="pause" aria-label="Pausa">Ⅱ</button></div><div class="event-toast" id="event" aria-live="polite"></div>
<div class="run-bottom"><div class="delivery-progress"><div><span>VALIGETTA IN TRANSITO</span><b id="distance">0 / 610 m</b></div><div class="progress-track"><i id="progress"></i></div></div><div class="dignity"><span>DIGNITÀ</span><div><i id="dignity"></i></div><b id="dignity-number">100%</b></div></div>
<div class="touch-controls"><div class="steer-pad"><button data-control="left" aria-label="Sterza a sinistra">←</button><button data-control="right" aria-label="Sterza a destra">→</button></div><div class="action-pad"><button data-control="jump" aria-label="Salta"><span>↑</span><small>SALTA</small></button><button data-control="punch" class="punch-button" aria-label="Bike Punch"><span>✦</span><small>PUNCH</small></button></div></div>
<section class="results" hidden><div class="result-copy"><div class="edition">YOUR BIKE TYSON MOMENT</div><h2 id="result-title">DELIVERED.<br><em>SORT OF.</em></h2><p id="result-description"></p><div class="result-stats"><div><span>PUNTI LOCALI</span><strong id="result-score">0</strong></div><div><span>DISASTRI</span><strong id="result-crashes">0</strong></div><div><span>IN VOLO</span><strong id="result-air">0s</strong></div></div><p class="local-note">Record sul tuo dispositivo · non verificato · nessun premio</p><button class="play-button" id="again">UN’ULTIMA CONSEGNA <span>↗</span></button><div class="result-actions"><button id="replay-again">↻ Riguarda</button><button id="home">Torna in officina</button></div></div><div class="replay-card"><canvas id="clip" width="360" height="640" aria-label="Replay verticale della corsa appena giocata"></canvas><span class="replay-badge" id="replay-badge">● REPLAY · 0.5×</span><div class="clip-actions"><button id="download" disabled>Preparazione video…</button><button id="share" disabled aria-label="Condividi il momento">↗</button></div><p id="clip-note">8 secondi del tuo caos. Nessun filmato inventato.</p></div></section>
<div class="paused-overlay" hidden><div><span class="edition">UNA BREVE CRISI ESISTENZIALE</span><h2>IN PAUSA.</h2><p id="pause-reason">La valigetta può aspettare. Per una volta.</p><button class="play-button" id="resume">RIPRENDI <span>↗</span></button><button class="text-button" id="quit">Torna in officina</button></div></div>
<div class="loading" id="loading"><span class="loader"></span> Gonfiaggio ego in corso…</div>
</main><footer><span>© BIKE TYSON · ORIGINAL CHARACTER</span><span>POWERED BY <b>DEVFRIDGE</b></span><button id="quality">Grafica: alta</button></footer>
<dialog id="help-dialog"><button class="dialog-close" aria-label="Chiudi istruzioni">×</button><span class="edition">MANUALE DEL PERFETTO DISASTRO</span><h2>UN SOLO<br><em>LAVORO.</em></h2><p>Raggiungi la destinazione prima di 45 secondi senza esaurire la dignità. La bici accelera da sola.</p><ol class="instructions"><li><b>STERZA</b><span>Frecce / A e D, oppure i pulsanti sul telefono.</span></li><li><b>SALTA</b><span>Spazio o ↑. Supera barriere e cerca le rampe.</span></li><li><b>BIKE PUNCH</b><span>X o pulsante ✦. Colpisci da vicino gli ostacoli: gli idranti ti lanciano in aria, gli autobus si scusano.</span></li></ol><p>Le schivate ravvicinate e i pugni aumentano il moltiplicatore. Le collisioni consumano dignità. Ogni corsa genera un Funny Finish di 8 secondi.</p><p class="fineprint">Il video esportato contiene sottotitoli ed effetti sonori. La voce del dispositivo è solo in riproduzione. Formato e condivisione dipendono dal browser.</p><button class="play-button dialog-close-action">CI SONO. PIÙ O MENO. <span>↗</span></button></dialog>
<dialog id="pass-dialog"><button class="dialog-close" aria-label="Chiudi Delivery Pass">×</button><span class="edition">BIKE TYSON × DEVFRIDGE</span><h2>DELIVERY<br><em>PASS.</em></h2><p>La pratica è sempre gratuita. Il pass sblocca <b>Midnight Dispatch</b>, una consegna speciale con la stessa regola di accesso per tutti.</p><div class="policy"><strong>1.000 <small>BIKE TYSON</small></strong><span>In uno o più lock attivi · nessuna durata minima</span></div><div class="wallet-status"><span id="wallet-address">Wallet non collegato</span><p id="wallet-status" aria-live="polite"></p></div><div class="wallet-buttons"><button class="play-button" id="connect">COLLEGA PHANTOM <span>↗</span></button><button class="play-button" id="authenticate" hidden>ACCEDI E VERIFICA <span>↗</span></button><button class="text-button" id="recheck" hidden>Ricontrolla i lock</button><button class="text-button" id="disconnect" hidden>Scollega</button><button class="play-button" id="special" hidden>GIOCA MIDNIGHT DISPATCH <span>↗</span></button><a id="phantom-link" class="text-link" hidden>Apri nel browser Phantom ↗</a></div><details><summary>Regole, scadenza e costi</summary><p>I lock dello stesso mint si sommano. Servono almeno 1.000 token ancora bloccati (1.000.000.000 unità minime). I lock scaduti smettono di contare. Se l’accesso termina durante una corsa, la corsa prosegue in pratica. I record locali rimangono.</p><p><b>Nessun prelievo anticipato.</b> Dopo la scadenza, il rimborso DevFridge applica il <b>2% dei token riscattati</b> per acquistare e bruciare PASTA; i costi di rete sono separati. Non viene addebitata una seconda commissione dal gioco.</p><p><b>La scadenza non garantisce il rimborso immediato:</b> per token diversi da PASTA serve una rotta Jupiter eseguibile. La rotta per questo mint non è stata verificata. In questo prototipo la creazione di nuovi lock non è attiva.</p><p>Il pass legge il programma DevFridge esistente. Connessione, firma di accesso, idoneità dei token e verifica del punteggio sono operazioni distinte. Queste corse non assegnano premi e non registrano punteggi on-chain.</p><code>${MINT}</code><p>Solana mainnet · Token-2022 · 6 decimali. Dati mint osservati il 22 settembre 2026 e ricontrollati dal server all’accesso.</p><a href="https://scan.devfridge.cool/t/${MINT}" target="_blank" rel="noopener noreferrer">Consulta il mint su DevFridge Scan ↗</a></details><p class="fineprint">La firma di accesso è un messaggio, non una transazione. Non chiediamo seed phrase o chiavi private.</p></dialog>`;

const stage=$('.stage'),world=$<HTMLCanvasElement>('#world'),clip=$<HTMLCanvasElement>('#clip'),clipCtx=clip.getContext('2d')!;
const audio=new GameAudio();let run=createRun(111),phase='ready',pausedPhase='playing',city:CityScene;
let last=0,accumulator=0,clock=0,toastUntil=0,replayClock=0,lastReplayT=0,replay=selectReplay(run),lowQuality=false;
let best=0;try{best=Number(localStorage.getItem('bike-tyson-best-v1'))||0;}catch{}
$('#best').textContent=best?best.toLocaleString('it-IT'):'NESSUN DISASTRO. ANCORA.';
let recorder:MediaRecorder|null=null,recordingStream:MediaStream|null=null,clipBlob:Blob|null=null,clipUrl='',captureId=0,replayComplete=false;
const held=new Set<string>(),queued=new Set<string>();const input={steer:0,jump:false,punch:false};
function clearInput(){held.clear();queued.clear();input.steer=0;input.jump=false;input.punch=false;}
function updateInput(){input.steer=(held.has('right')?1:0)-(held.has('left')?1:0);input.jump=held.has('jump');input.punch=held.has('punch');}
const pass=new DeliveryPass(updatePass);
function updatePass(){
  $('#wallet-status').textContent=pass.message;$('#wallet-address').textContent=pass.wallet?`${pass.wallet.slice(0,6)}…${pass.wallet.slice(-6)} · ${pass.authenticated?'identità verificata':'solo collegato'}`:'Wallet non collegato';
  $<HTMLButtonElement>('#connect').hidden=!!pass.wallet;$<HTMLButtonElement>('#connect').disabled=pass.busy;
  $<HTMLButtonElement>('#authenticate').hidden=!pass.wallet||pass.authenticated;$<HTMLButtonElement>('#authenticate').disabled=pass.busy;
  $('#recheck').hidden=!pass.authenticated;$<HTMLButtonElement>('#recheck').disabled=pass.busy;$('#disconnect').hidden=!pass.wallet;$('#special').hidden=!pass.eligible;
  $('.status-dot').classList.toggle('active',pass.eligible);
  if(run.special&&!pass.eligible){run.special=false;$('#mode-label').textContent='PRATICA';toast('PASS SCADUTO O NON DISPONIBILE · CONTINUI IN PRATICA');}
}
$('#connect').onclick=()=>void pass.connect();$('#authenticate').onclick=()=>void pass.authenticate();$('#recheck').onclick=()=>void pass.check();$('#disconnect').onclick=()=>void pass.disconnect();
if(location.protocol==='https:'){const link=$<HTMLAnchorElement>('#phantom-link');link.href=`https://phantom.app/ul/browse/${encodeURIComponent(location.origin+location.pathname)}?ref=${encodeURIComponent(location.origin)}`;link.hidden=false;}
updatePass();
function toast(message:string){$('#event').textContent=message;$('#event').classList.add('show');toastUntil=clock+2.5;}
function setPhase(value:string){phase=value;stage.dataset.phase=value;$('.results').hidden=!['replay','result'].includes(value);$('.paused-overlay').hidden=value!=='paused';}
function pause(reason?:string){if(!['playing','replay'].includes(phase))return;pausedPhase=phase;setPhase('paused');clearInput();audio.pause();if(recorder?.state==='recording')recorder.pause();$('#pause-reason').textContent=reason||'La valigetta può aspettare. Per una volta.';}
async function resume(){if(phase!=='paused')return;await audio.start().catch(()=>{});last=performance.now();accumulator=0;if(recorder?.state==='paused')recorder.resume();setPhase(pausedPhase);}
function openDialog(id:string){pause();clearInput();$<HTMLDialogElement>(id).showModal();}
$('#help-button').onclick=()=>openDialog('#help-dialog');$('#pass-button').onclick=()=>openDialog('#pass-dialog');
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog=>{dialog.querySelectorAll<HTMLElement>('.dialog-close,.dialog-close-action').forEach(button=>button.onclick=()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
function stopRecording(discard=false){if(discard)captureId++;if(recorder&&recorder.state!=='inactive')recorder.stop();recorder=null;if(discard){recordingStream?.getTracks().forEach(t=>t.stop());recordingStream=null;}}
function home(){stopRecording(true);clearInput();audio.pause();run=createRun(111);city.setRun(run.obstacles);setPhase('ready');$('#event').classList.remove('show');}
async function start(special=false){
  if(!city||special&&!pass.eligible)return;
  stopRecording(true);clearInput();run=createRun(special?Math.floor(Date.now()/86400000):Date.now(),special);city.setRun(run.obstacles);
  await audio.start().catch(()=>{});$('#mode-label').textContent=special?'MIDNIGHT DISPATCH':'PRATICA';
  stage.classList.toggle('special-run',special);setPhase('playing');last=performance.now();accumulator=0;toast('CONSEGNA LA VALIGETTA. LA DIGNITÀ È FACOLTATIVA.');
}
$('#start').onclick=()=>void start();$('#again').onclick=()=>void start(run.special&&pass.eligible);$('#special').onclick=()=>{$<HTMLDialogElement>('#pass-dialog').close();void start(true);};
$('#home').onclick=home;$('#quit').onclick=home;$('#pause').onclick=()=>pause();$('#resume').onclick=()=>void resume();
$('#sound').onclick=()=>{audio.toggle();$('#sound').textContent=audio.enabled?'♪':'♪̸';$('#sound').setAttribute('aria-label',audio.enabled?'Disattiva audio':'Attiva audio');if(audio.enabled)void audio.start();};
$('#quality').onclick=()=>{lowQuality=!lowQuality;city.quality(lowQuality);$('#quality').textContent=`Grafica: ${lowQuality?'leggera':'alta'}`;};
const keys:Record<string,string>={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyX:'punch'};
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.code==='Escape'||e.code==='KeyP'){if(phase==='paused')void resume();else pause();return;}if(phase!=='playing'||!keys[e.code])return;e.preventDefault();held.add(keys[e.code]);if(!e.repeat)queued.add(keys[e.code]);updateInput();});
addEventListener('keyup',e=>{if(keys[e.code]){held.delete(keys[e.code]);updateInput();}});
document.querySelectorAll<HTMLButtonElement>('[data-control]').forEach(button=>{const action=button.dataset.control!;button.addEventListener('pointerdown',e=>{if(phase!=='playing')return;e.preventDefault();button.setPointerCapture(e.pointerId);held.add(action);queued.add(action);button.classList.add('pressed');updateInput();});for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{held.delete(action);button.classList.remove('pressed');updateInput();});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Corsa sospesa mentre eri fuori dal gioco. Premi riprendi quando sei pronto.');});
addEventListener('blur',()=>{clearInput();pause();});
world.addEventListener('webglcontextlost',e=>{e.preventDefault();pause('Grafica temporaneamente non disponibile. Attendi il ripristino del contesto.');$<HTMLButtonElement>('#resume').disabled=true;});
world.addEventListener('webglcontextrestored',()=>{$<HTMLButtonElement>('#resume').disabled=false;$('#pause-reason').textContent='Grafica ripristinata. Puoi riprendere.';});
function updateHUD(){const time=Math.max(0,DURATION-run.t);$('#timer').innerHTML=`${Math.floor(time).toString().padStart(2,'0')}<span>.${Math.floor(time%1*10)}</span>`;$('#score').textContent=Math.floor(run.score).toString().padStart(4,'0');$('#multiplier').textContent=run.multiplier.toFixed(1);$('#distance').textContent=`${Math.min(FINISH,Math.floor(run.distance))} / ${FINISH} m`;$('#progress').style.width=`${Math.min(100,run.distance/FINISH*100)}%`;$('#dignity').style.width=`${run.dignity}%`;$('#dignity-number').textContent=`${run.dignity}%`;}
function result(){
  clearInput();$('#result-title').innerHTML=run.delivered?'DELIVERED.<br><em>ALLEGEDLY.</em>':'ARRIVED.<br><em>DIFFERENTLY.</em>';
  $('#result-description').textContent=run.delivered?'La valigetta è arrivata. Nessuno vuole sapere come.':run.dignity<=0?'La dignità ha abbandonato la consegna. La bici chiede un altro tentativo.':'Il tempo è finito. Il destinatario sta ancora guardando fuori dalla finestra.';
  $('#result-score').textContent=Math.floor(run.score).toLocaleString('it-IT');$('#result-crashes').textContent=String(run.crashes);$('#result-air').textContent=`${run.air.toFixed(1)}s`;
  if(run.score>best){best=Math.floor(run.score);try{localStorage.setItem('bike-tyson-best-v1',String(best));}catch{}$('#best').textContent=best.toLocaleString('it-IT');}
  beginReplay();
}
function beginReplay(){
  stopRecording(true);replay=selectReplay(run);replayClock=0;lastReplayT=replay.start-.01;replayComplete=false;clipBlob=null;if(clipUrl){URL.revokeObjectURL(clipUrl);clipUrl='';}
  $('#download').textContent='Preparazione video…';$<HTMLButtonElement>('#download').disabled=true;$<HTMLButtonElement>('#share').disabled=true;$('#replay-badge').textContent='● REPLAY · 0.5×';
  $('#clip-note').textContent='8 secondi del tuo caos. Video con sottotitoli e suoni.';
  setPhase('replay');audio.narrate(replay.caption);const id=++captureId;
  if(typeof MediaRecorder==='undefined'||!clip.captureStream){$('#clip-note').textContent='Video non supportato qui. Potrai salvare un fotogramma.';return;}
  const type=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/mp4','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type)return;
  try {
    recordingStream=clip.captureStream(30);audio.destination?.stream.getAudioTracks().forEach(t=>recordingStream!.addTrack(t.clone()));
    const stream=recordingStream,parts:BlobPart[]=[];recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2200000});
    recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};
    recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(id!==captureId)return;clipBlob=new Blob(parts,{type});clipUrl=URL.createObjectURL(clipBlob);$('#download').textContent='SCARICA IL MOMENTO ↓';$<HTMLButtonElement>('#download').disabled=false;$<HTMLButtonElement>('#share').disabled=false;};
    recorder.onerror=()=>{if(id===captureId){$('#clip-note').textContent='Registrazione non riuscita. Riguarda il replay o salva il fotogramma.';clipBlob=null;}};
    recorder.start();
  }catch{recordingStream?.getTracks().forEach(t=>t.stop());recorder=null;$('#clip-note').textContent='Registrazione non disponibile. Puoi salvare il fotogramma.';}
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
$('#share').onclick=async()=>{if(!clipBlob)return;const file=new File([clipBlob],`bike-tyson-moment.${clipBlob.type.includes('mp4')?'mp4':'webm'}`,{type:clipBlob.type});try{if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'Your Bike Tyson Moment',text:'Ride. Punch. Crash. Deliver.'});else{$('#clip-note').textContent='Scarica il video e allegalo al tuo post: questo browser non condivide file.';}}catch(error){$('#clip-note').textContent=error instanceof Error&&error.name==='AbortError'?'Condivisione annullata. Il video è ancora qui.':'Condivisione non riuscita. Puoi scaricare il video.';}};
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
    drawClip();if(replayClock>=8){replayComplete=true;setPhase('result');$('#replay-badge').textContent='IL TUO MOMENTO · 8 SEC';stopRecording();if(!recorder&&!clipBlob){$('#download').textContent='SCARICA FOTOGRAMMA ↓';$<HTMLButtonElement>('#download').disabled=false;}}
  }else if(phase==='playing'||phase==='ready'&&(!city.reduced||city.needsFrame))city.render(snapshot(run),run.obstacles,phase,clock);
}
try{city=new CityScene(world);city.setRun(run.obstacles);$('#loading').remove();requestAnimationFrame(animate);}
catch(error){$('#loading').innerHTML='<strong>La città richiede WebGL 2.</strong><p>Attiva l’accelerazione grafica o prova un browser aggiornato.</p>';console.error(error);$<HTMLButtonElement>('#start').disabled=true;}
Object.defineProperty(window,'__BIKE_DIAGNOSTICS',{value:()=>({phase,run:snapshot(run),done:run.done,delivered:run.delivered,stats:city?.stats,recording:recorder?.state??null,replayComplete,clipBytes:clipBlob?.size??0,passEligible:pass.eligible})});
