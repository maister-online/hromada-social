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

  public startBackgroundMusic(): void {
    this.ensureBgm();
    if (!this.musicEnabled || this.muted || !this.bgmAudio) return;
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.musicVolume;
    this.bgmAudio.muted = false;
    if (this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {
        // The game-start button is a user gesture; retry on the next interaction if needed.
      });
    }
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

  // Quiet air/line swish during the cast, not a synthetic rising tone.
  public playCast(): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.24);
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const envelope = Math.sin(Math.PI * t) * Math.pow(1 - t * 0.35, 1.4);
      samples[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1050, now);
    filter.frequency.exponentialRampToValueAtTime(480, now + 0.23);
    filter.Q.value = 0.55;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(now);
  }

  // Layered water-entry sound: soft impact, bright splash, hollow water body and droplets.
  public playSplash(intensity = 1.0): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const level = Math.min(1.25, Math.max(0.15, intensity));

    const makeNoise = (duration: number, color: 'white' | 'brown' = 'white') => {
      const length = Math.max(1, Math.floor(this.ctx!.sampleRate * duration));
      const buffer = this.ctx!.createBuffer(1, length, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      let low = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        low = (low + 0.11 * white) / 1.11;
        data[i] = color === 'brown' ? low * 3.1 : white;
      }
      return buffer;
    };

    // Main splash: broad water slap with a fast attack and soft falling tail.
    const impact = this.ctx.createBufferSource();
    impact.buffer = makeNoise(0.34, 'brown');
    const impactFilter = this.ctx.createBiquadFilter();
    impactFilter.type = 'lowpass';
    impactFilter.frequency.setValueAtTime(1900, now);
    impactFilter.frequency.exponentialRampToValueAtTime(520, now + 0.32);
    const impactGain = this.ctx.createGain();
    impactGain.gain.setValueAtTime(0.0001, now);
    impactGain.gain.linearRampToValueAtTime(0.19 * level, now + 0.009);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    impact.connect(impactFilter);
    impactFilter.connect(impactGain);
    impactGain.connect(this.ctx.destination);
    impact.start(now);

    // Fine surface spray, brighter and shorter than the body of the splash.
    const spray = this.ctx.createBufferSource();
    spray.buffer = makeNoise(0.24);
    const sprayFilter = this.ctx.createBiquadFilter();
    sprayFilter.type = 'highpass';
    sprayFilter.frequency.setValueAtTime(1250, now);
    sprayFilter.Q.value = 0.55;
    const sprayGain = this.ctx.createGain();
    sprayGain.gain.setValueAtTime(0.0001, now);
    sprayGain.gain.linearRampToValueAtTime(0.075 * level, now + 0.004);
    sprayGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    spray.connect(sprayFilter);
    sprayFilter.connect(sprayGain);
    sprayGain.connect(this.ctx.destination);
    spray.start(now);

    // Three tiny irregular droplets give the entry a natural, non-electronic tail.
    for (let i = 0; i < 3; i++) {
      const delay = 0.045 + i * 0.052 + Math.random() * 0.025;
      const drop = this.ctx.createBufferSource();
      drop.buffer = makeNoise(0.055);
      const dropFilter = this.ctx.createBiquadFilter();
      dropFilter.type = 'bandpass';
      dropFilter.frequency.setValueAtTime(1500 + Math.random() * 900, now + delay);
      dropFilter.Q.value = 0.8;
      const dropGain = this.ctx.createGain();
      dropGain.gain.setValueAtTime(0.0001, now + delay);
      dropGain.gain.linearRampToValueAtTime(0.025 * level, now + delay + 0.003);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.052);
      drop.connect(dropFilter);
      dropFilter.connect(dropGain);
      dropGain.connect(this.ctx.destination);
      drop.start(now + delay);
    }
  }

  public playWaterEntry(intensity = 0.8): void {
    this.playSplash(intensity);
  }

  // A quiet natural water plip instead of an electronic notification bell.
  public playBiteBell(): void {
    if (this.muted || !this.ctx) return;
    this.playSplash(0.3);
  }

  // Short line/rod "twang" when the angler sets the hook.
  public playHookSet(): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const body = this.ctx.createGain();
    const noise = this.ctx.createBufferSource();
    const length = Math.floor(this.ctx.sampleRate * 0.11);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1250, now);
    filter.Q.value = 1.1;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(185, now);
    osc.frequency.exponentialRampToValueAtTime(92, now + 0.12);
    body.gain.setValueAtTime(0.0001, now);
    body.gain.linearRampToValueAtTime(0.09, now + 0.012);
    body.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.045, now + 0.006);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(body);
    body.connect(this.ctx.destination);
    noise.connect(filter);
    filter.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
    noise.start(now);
  }

  // Soft, irregular reel/drag clicks with filtered noise, not a repeating square-wave beep.
  public playReelTick(tensionRatio: number): void {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const length = Math.floor(this.ctx.sampleRate * 0.045);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.4);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850 + tensionRatio * 950 + Math.random() * 180, now);
    filter.Q.value = 1.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.018 + tensionRatio * 0.018, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(now);
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
