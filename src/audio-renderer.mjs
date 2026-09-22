// Renders Gemini's declarative compositions. No generated executable code is evaluated.
export function validateScore(score) {
  const waves = new Set(['sine','triangle','square','sawtooth','noise']);
  const finite = (n,min,max) => Number.isFinite(n) && n>=min && n<=max;
  for (const name of ['punch','jump','near','geyser','crash','bus','pigeon','finish']) {
    const layers=score.effects?.[name];
    if (!Array.isArray(layers)||layers.length<2||layers.length>24) throw Error(`Invalid effect: ${name}`);
    for(const l of layers)if(!waves.has(l.wave)||!finite(l.at,0,2)||!finite(l.duration,.01,2)||l.at+l.duration>2.1||!finite(l.startHz,20,20000)||!finite(l.endHz,20,20000)||!finite(l.gain,0,.5))throw Error(`Invalid layer: ${name}`);
  }
  for(const name of ['workshop','replay']){
    const track=score.music?.[name];if(!track||!finite(track.bpm,60,200)||!finite(track.beats,4,64))throw Error(`Invalid music: ${name}`);
    for(const part of ['melody','bass']){
      const notes=track[part];if(!Array.isArray(notes)||!notes.length||notes.length>256)throw Error(`Invalid notes: ${name}`);
      for(const n of notes)if(!Array.isArray(n)||n.length!==4||!finite(n[0],0,track.beats)||!finite(n[1],24,100)||!finite(n[2],.05,8)||n[0]+n[2]>track.beats+.001||!finite(n[3],0,1))throw Error(`Invalid note: ${name}`);
    }
  }
  return score;
}
function tone(ctx,bus,layer,seed=1){
  const start=layer.at,end=start+layer.duration,gain=ctx.createGain();
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(layer.gain,start+Math.min(.008,layer.duration*.1));
  gain.gain.exponentialRampToValueAtTime(.0001,end);gain.connect(bus);
  let source;
  if(layer.wave==='noise'){
    source=ctx.createBufferSource();const buffer=ctx.createBuffer(1,Math.ceil(layer.duration*ctx.sampleRate),ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/2147483648-1;}
    source.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.Q.value=.8;filter.frequency.setValueAtTime(layer.startHz,start);filter.frequency.exponentialRampToValueAtTime(layer.endHz,end);source.connect(filter);filter.connect(gain);
  }else{source=ctx.createOscillator();source.type=layer.wave;source.frequency.setValueAtTime(layer.startHz,start);source.frequency.exponentialRampToValueAtTime(layer.endHz,end);source.connect(gain);}
  source.start(start);source.stop(end);
}
function normalize(buffer,ceiling){
  let peak=0;for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(const x of data)peak=Math.max(peak,Math.abs(x));}
  const scale=peak>0?ceiling/peak:1;for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++)data[i]*=scale;}
  return buffer;
}
export async function renderScore(score,Offline=OfflineAudioContext){
  validateScore(score);const sampleRate=24000,entries=[];
  for(const [name,layers]of Object.entries(score.effects))entries.push((async()=>{
    const duration=Math.max(...layers.map(l=>l.at+l.duration))+.04,ctx=new Offline(1,Math.ceil(duration*sampleRate),sampleRate);
    layers.forEach((layer,i)=>tone(ctx,ctx.destination,layer,717+i));return[name,normalize(await ctx.startRendering(),.78)];
  })());
  for(const [name,track]of Object.entries(score.music))entries.push((async()=>{
    const beat=60/track.bpm,ctx=new Offline(1,Math.ceil(track.beats*beat*sampleRate),sampleRate);
    for(const part of ['melody','bass'])for(const [at,note,length,velocity]of track[part]){
      const frequency=440*2**((note-69)/12);
      tone(ctx,ctx.destination,{wave:part==='bass'?'sine':'triangle',at:at*beat,duration:length*beat,startHz:frequency,endHz:frequency,gain:velocity*(part==='bass'?.36:.25)});
      if(part==='melody')tone(ctx,ctx.destination,{wave:'sine',at:at*beat,duration:length*beat*.55,startHz:frequency*2,endHz:frequency*2,gain:velocity*.05});
    }
    return[name,normalize(await ctx.startRendering(),.68)];
  })());
  return new Map(await Promise.all(entries));
}
