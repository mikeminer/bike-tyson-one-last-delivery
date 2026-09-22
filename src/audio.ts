import score from './gemini-score.json';
import { renderScore } from './audio-renderer.mjs';
type Voice = { source: AudioBufferSourceNode; gain: GainNode };

export class GameAudio {
  context?: AudioContext;
  destination?: MediaStreamAudioDestinationNode;
  master?: GainNode;
  enabled = true;
  private musicBus?: GainNode;
  private effectsBus?: GainNode;
  private analyser?: AnalyserNode;
  private buffers = new Map<string, AudioBuffer>();
  private loading?: Promise<void>;
  private music?: Voice;
  private scene = 'idle';
  private live = new Set<Voice>();
  private lastCue = new Map<string, number>();
  private failures: string[] = [];
  private played: Record<string, number> = {};

  async start() {
    if (!this.context) {
      const ctx = this.context = new AudioContext();
      this.master = ctx.createGain(); this.musicBus = ctx.createGain(); this.effectsBus = ctx.createGain();
      this.musicBus.gain.value = .3; this.effectsBus.gain.value = .6;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -10; limiter.knee.value = 12; limiter.ratio.value = 8;
      limiter.attack.value = .003; limiter.release.value = .18;
      this.musicBus.connect(limiter); this.effectsBus.connect(limiter); limiter.connect(this.master);
      this.destination = ctx.createMediaStreamDestination(); this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.master.connect(ctx.destination); this.master.connect(this.destination); this.master.connect(this.analyser);
    }
    // Resume within the input gesture; compiling the score never blocks starting a run.
    await this.context.resume();
    this.master!.gain.setTargetAtTime(this.enabled ? .65 : 0, this.context.currentTime, .015);
    this.loading ??= this.load();
  }
  private async load() {
    try { this.buffers = await renderScore(score); this.playMusic(); }
    catch { this.failures.push('Gemini score could not render'); }
  }
  setScene(phase: string) {
    if (phase === 'paused') return;
    const next = phase === 'playing' ? 'workshop' : phase === 'replay' ? 'replay' : 'idle';
    if (next === this.scene) return;
    this.scene = next; this.stopEffects(); this.lastCue.clear(); this.playMusic();
  }
  private playMusic() {
    this.stopMusic();
    const buffer = this.buffers.get(this.scene);
    if (!buffer || !this.context || !this.musicBus) return;
    const ctx = this.context, source = ctx.createBufferSource(), gain = ctx.createGain();
    source.buffer = buffer; source.loop = this.scene === 'workshop';
    // Fit the complete Gemini replay phrase, including its wrong-note ending, into the 8-second clip.
    if (this.scene === 'replay') source.playbackRate.value = buffer.duration / 8;
    source.connect(gain); gain.connect(this.musicBus);
    gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(1, ctx.currentTime + .25);
    source.start(); this.music = { source, gain };
    source.onended = () => { source.disconnect(); gain.disconnect(); };
  }
  private stopMusic() {
    if (!this.music) return;
    const { source, gain } = this.music; this.music = undefined;
    if (!this.context || this.context.state !== 'running') { source.stop(); return; }
    const now = this.context.currentTime;
    gain.gain.cancelScheduledValues(now); gain.gain.setTargetAtTime(0, now, .025); source.stop(now + .12);
  }
  private stopEffects() { for (const voice of this.live) voice.source.stop(); this.live.clear(); }
  toggle() {
    this.enabled = !this.enabled;
    if (this.master && this.context) this.master.gain.setTargetAtTime(this.enabled ? .65 : 0, this.context.currentTime, .015);
    if (!this.enabled && 'speechSynthesis' in window) speechSynthesis.cancel();
  }
  react(kind: string) {
    const ctx = this.context;
    if (!ctx || !this.enabled || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    if (now - (this.lastCue.get(kind) ?? -99) < .12) return;
    this.lastCue.set(kind, now);
    const name = kind === 'ramp' ? 'jump' : kind === 'smash' ? 'crash' : kind;
    const buffer = this.buffers.get(name);
    if (!buffer || !this.effectsBus) return;
    if (this.live.size >= 6) {
      const oldest = this.live.values().next().value; if (oldest) { oldest.source.stop(); this.live.delete(oldest); }
    }
    const source = ctx.createBufferSource(), gain = ctx.createGain(); source.buffer = buffer;
    source.connect(gain); gain.connect(this.effectsBus);
    const voice = { source, gain }; this.live.add(voice);
    source.onended = () => { this.live.delete(voice); source.disconnect(); gain.disconnect(); };
    source.start(); this.played[kind] = (this.played[kind] ?? 0) + 1;
    this.musicBus!.gain.cancelScheduledValues(now); this.musicBus!.gain.setTargetAtTime(.13, now, .02);
    this.musicBus!.gain.setTargetAtTime(.3, now + Math.min(buffer.duration, .6), .18);
  }
  narrate(text: string) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const voice = new SpeechSynthesisUtterance(text.toLowerCase());
    voice.lang = 'en-US'; voice.rate = .85; voice.pitch = .75; voice.volume = .65;
    speechSynthesis.speak(voice);
  }
  pause() { this.context?.suspend(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  get diagnostics() {
    const samples = new Float32Array(256); this.analyser?.getFloatTimeDomainData(samples);
    return { state: this.context?.state ?? 'uninitialized', enabled: this.enabled, scene: this.scene,
      loaded: [...this.buffers.keys()], failures: [...this.failures], liveEffects: this.live.size,
      musicPlaying: !!this.music, played: { ...this.played }, outputRms: Math.sqrt(samples.reduce((s,x)=>s+x*x,0)/samples.length) };
  }
}
