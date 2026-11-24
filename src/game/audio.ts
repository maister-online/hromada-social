const BGM_TRACK_URL = `${import.meta.env.BASE_URL}assets/aistudio/7b809fb1bc83164_0d6a9fbd.mp3`;

class PolissiaAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private musicEnabled = true;
  private musicVolume = 0.36;
  private ambientGain: GainNode | null = null;
  private ambientRunning = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private gestureHooked = false;

  public init(): void {
    this.ensureBgm();
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.startNatureAmbience();
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.syncBgmPlayback();
  }

  public installUnlockListener(): () => void {
    if (this.gestureHooked || typeof window === 'undefined') {
      return () => {};
    }
    this.gestureHooked = true;
    const onGesture = () => {
      this.init();
    };
    window.addEventListener('pointerdown', onGesture, { passive: true });
    window.addEventListener('keydown', onGesture, { passive: true });
    return () => {
      this.gestureHooked = false;
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }

  private ensureBgm(): void {
    if (this.bgmAudio || typeof Audio === 'undefined') return;
    const audio = new Audio(BGM_TRACK_URL);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = this.musicVolume;
    audio.muted = this.muted || !this.musicEnabled;
    this.bgmAudio = audio;
  }

  private syncBgmPlayback(): void {
    if (!this.bgmAudio) return;
    this.bgmAudio.volume = this.musicVolume;
    this.bgmAudio.muted = this.muted || !this.musicEnabled;
    if (!this.muted && this.musicEnabled) {
      if (this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {
          // Will start automatically on next user gesture
        });
      }
    } else if (!this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
  }

  public setMuted(m: boolean): void {
    this.muted = m;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(m ? 0 : 0.04, this.ctx.currentTime, 0.15);
    }
    this.syncBgmPlayback();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.ensureBgm();
    this.syncBgmPlayback();
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  private startNatureAmbience(): void {
    if (!this.ctx || this.ambientRunning) return;
    this.ambientRunning = true;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.018 * white) / 1.018;
      data[i] = last * 1.4;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 0.6;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = this.muted ? 0 : 0.04;

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    noise.start();
  }

  public playCast(): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.28);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playSplash(intensity = 1.0): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.28);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, 1.8);
      ch[i] = (Math.random() * 2 - 1) * env * 0.55;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filt = this.ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(1400 * intensity, now);
    filt.frequency.exponentialRampToValueAtTime(320, now + 0.26);

    const g = this.ctx.createGain();
    g.gain.value = 0.18 * Math.min(1.5, intensity);
    src.connect(filt);
    filt.connect(g);
    g.connect(this.ctx.destination);
    src.start(now);
  }

  public playBiteBell(): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [980, 1460].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.09, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  }

  public playReelTick(tensionRatio: number): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240 + tensionRatio * 340, now);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  public playCatch(isMutant: boolean): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = isMutant ? [330, 440, 622, 830] : [392, 493.88, 587.33, 783.99];
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isMutant ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.07);
      gain.gain.setValueAtTime(0.08, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.34);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.36);
    });
  }

  public playSnap(): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playCoin(): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    [880, 1174].forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.055);
      gain.gain.setValueAtTime(0.07, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.18);
    });
  }
}

export const audioEngine = new PolissiaAudioEngine();
