export class GameAudio {
  context?: AudioContext;
  destination?: MediaStreamAudioDestinationNode;
  master?: GainNode;
  enabled = true;
  async start() {
    if (!this.context) {
      this.context = new AudioContext(); this.master = this.context.createGain();
      this.destination = this.context.createMediaStreamDestination();
      this.master.connect(this.context.destination); this.master.connect(this.destination);
    }
    await this.context.resume(); this.master!.gain.value = this.enabled ? .2 : 0;
  }
  toggle() { this.enabled = !this.enabled; if (this.master) this.master.gain.value = this.enabled ? .2 : 0; if (!this.enabled && 'speechSynthesis' in window) speechSynthesis.cancel(); }
  tone(frequency = 280, duration = .15, shape: OscillatorType = 'sine', end = 60) {
    if (!this.context || !this.master || !this.enabled || this.context.state !== 'running') return;
    const osc = this.context.createOscillator(), volume = this.context.createGain(), now = this.context.currentTime;
    osc.type = shape; osc.frequency.setValueAtTime(frequency, now); osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
    volume.gain.setValueAtTime(.5, now); volume.gain.exponentialRampToValueAtTime(.001, now + duration);
    osc.connect(volume); volume.connect(this.master); osc.start(); osc.stop(now + duration);
    osc.onended = () => { osc.disconnect(); volume.disconnect(); };
  }
  react(kind: string) {
    if (kind === 'near') this.tone(700, .14, 'sine', 1200);
    else if (kind === 'geyser' || kind === 'ramp') this.tone(140, .6, 'triangle', 1100);
    else if (kind === 'finish') { this.tone(440, .6, 'triangle', 880); }
    else if (kind === 'punch') this.tone(100, .12, 'triangle', 25);
    else this.tone(170, .3, 'sawtooth', 35);
  }
  narrate(text: string) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const voice = new SpeechSynthesisUtterance(text.toLowerCase());
    voice.lang = 'en-US'; voice.rate = .85; voice.pitch = .75; voice.volume = .8;
    speechSynthesis.speak(voice);
  }
  pause() { this.context?.suspend(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
}
