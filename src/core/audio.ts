/**
 * Clean & Safe Procedural Web Audio Engine for Dhaaga.
 * 
 * Features:
 * - Pure, soothing, melodic Indian ceremonial sounds (Mandir Ghanti, Ghungroo, Sitar swaras, Shankh, Tanpura)
 * - Strict volume safety: Master Dynamics Compressor Limiter + capped master gain
 * - Zero audio leakage: Instantly suspends AudioContext and zeroes gain when muted
 * - Non-destructive finite-lifetime synthesis (no runaway feedback delay loops)
 * - One-time reverb bus routing (no multiplying connections)
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private reverbNode: ConvolverNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGainNode: GainNode | null = null;
  private sargamNoteIndex: number = 0;

  // Raag Yaman Swaras (Frequencies in Hz: Sa, Re, Ga, Tivra Ma, Pa, Dha, Ni, Taar Sa)
  private readonly SWARAS = [
    261.63, // Sa (C4)
    293.66, // Re (D4)
    329.63, // Ga (E4)
    369.99, // Tivra Ma (F#4)
    392.00, // Pa (G4)
    440.00, // Dha (A4)
    493.88, // Ni (B4)
    523.25, // Taar Sa (C5)
    587.33, // Taar Re (D5)
    659.25, // Taar Ga (E5)
  ];

  constructor() {
    try {
      const saved = localStorage.getItem('dhaaga_sound_enabled');
      this.isMuted = saved !== 'true';
    } catch {
      this.isMuted = true;
    }
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('dhaaga_sound_enabled', (!muted).toString());
    } catch {}

    if (muted) {
      if (this.masterGainNode && this.ctx) {
        try {
          this.masterGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
          this.masterGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        } catch {}
      }
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    } else {
      const ctx = this.initCtx();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (this.masterGainNode && this.ctx) {
        try {
          this.masterGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
          this.masterGainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
        } catch {}
      }
    }
  }

  /**
   * Initializes Web Audio Context with Master Bus, Compressor Limiter, and Temple Reverb.
   */
  private initCtx(): AudioContext | null {
    if (this.isMuted) return null;

    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass({ latencyHint: 'interactive' });
        }
      } catch {
        return null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx && !this.masterGainNode) {
      try {
        // 1. Master Output Limiter (Prevents any sudden clipping or harsh sound)
        this.masterCompressor = this.ctx.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.masterCompressor.knee.setValueAtTime(10, this.ctx.currentTime);
        this.masterCompressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.masterCompressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
        this.masterCompressor.release.setValueAtTime(0.12, this.ctx.currentTime);
        this.masterCompressor.connect(this.ctx.destination);

        // 2. Master Output Gain
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.masterGainNode.connect(this.masterCompressor);

        // 3. Sacred Temple Reverb Impulse Response (Connected ONCE to masterGainNode)
        this.initReverb(this.ctx);
      } catch {}
    }

    return this.ctx;
  }

  /**
   * Generates a warm sacred temple hall impulse response for gentle spatial resonance.
   */
  private initReverb(ctx: AudioContext): void {
    try {
      const sampleRate = ctx.sampleRate;
      const duration = 1.4; // 1.4 second gentle decay
      const decay = 3.5;
      const length = Math.floor(sampleRate * duration);
      const impulse = ctx.createBuffer(2, length, sampleRate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * decay);
        const damp = Math.exp(-t * 3.5);
        left[i] = (Math.random() * 2 - 1) * env * damp * 0.3;
        right[i] = (Math.random() * 2 - 1) * env * damp * 0.3;
      }

      this.reverbNode = ctx.createConvolver();
      this.reverbNode.buffer = impulse;
      // Connect reverb node ONCE to master gain
      if (this.masterGainNode) {
        this.reverbNode.connect(this.masterGainNode);
      }
    } catch {
      this.reverbNode = null;
    }
  }

  /**
   * Safe audio routing to master bus.
   */
  private routeOutput(source: AudioNode, reverbSend: number = 0.2): void {
    if (!this.ctx || !this.masterGainNode || this.isMuted) return;

    try {
      // Dry path
      const dryGain = this.ctx.createGain();
      dryGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      source.connect(dryGain);
      dryGain.connect(this.masterGainNode);

      // Reverb send path
      if (this.reverbNode && reverbSend > 0.01) {
        const wetGain = this.ctx.createGain();
        wetGain.gain.setValueAtTime(reverbSend * 0.3, this.ctx.currentTime);
        source.connect(wetGain);
        wetGain.connect(this.reverbNode);
      }
    } catch {}
  }

  /**
   * Ghungroo (Delicate Brass Ankle Bells).
   * Soft, cheerful micro-chimes.
   */
  public playGhungroo(velocity: number = 1.0, pitchShift: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    const vol = Math.min(0.2, 0.08 * velocity);
    bus.gain.setValueAtTime(vol, now);

    const bellFrequencies = [2600, 3100, 3700, 4400, 5200];
    const bellCount = 4;

    for (let i = 0; i < bellCount; i++) {
      const strikeTime = now + i * 0.018 + Math.random() * 0.01;
      const freq = (bellFrequencies[i % bellFrequencies.length] + Math.random() * 200) * pitchShift;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, strikeTime);

      const decay = 0.06 + Math.random() * 0.04;
      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.15, strikeTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decay);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(strikeTime);
      osc.stop(strikeTime + decay + 0.02);
    }

    this.routeOutput(bus, 0.25);
  }

  /**
   * Mandir Ghanti (Pure Bronze Temple Bell).
   * Clean, meditative, warm harmonic chime.
   */
  public playMandirGhanti(octave: number = 1.0, intensity: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    const vol = Math.min(0.25, 0.12 * intensity);
    bus.gain.setValueAtTime(vol, now);

    // Fundamental note: Sa (523.25 Hz C5) or Pa (783.99 Hz G5)
    const baseFreq = 587.33 * octave; // D5 warm temple bell

    // Pure harmonious partials
    const partials = [
      { ratio: 1.0, amp: 0.6, decay: 2.2 },  // Fundamental
      { ratio: 1.5, amp: 0.35, decay: 1.8 }, // Perfect 5th
      { ratio: 2.0, amp: 0.25, decay: 1.4 }, // Octave
      { ratio: 2.76, amp: 0.12, decay: 0.9 }, // Bell sparkle
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(p.amp, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.00005, now + p.decay);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });

    this.routeOutput(bus, 0.4);
  }

  /**
   * Sacred Shankh Naad (Mellow, noble conch resonance).
   */
  public playShankh(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.001, now);
    bus.gain.linearRampToValueAtTime(0.18, now + 0.35);
    bus.gain.setValueAtTime(0.18, now + 0.9);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.linearRampToValueAtTime(277.18, now + 0.35); // Gentle embouchure glide
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 1.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, now);

    osc.connect(filter);
    filter.connect(bus);

    osc.start(now);
    osc.stop(now + 2.1);

    this.routeOutput(bus, 0.35);
  }

  /**
   * Sitar Pluck (Raag Yaman Melodic Swara).
   * Clean, sweet string pluck with gentle decay.
   */
  public playSitar(freq?: number, withMeend: boolean = false): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const targetFreq = freq || this.SWARAS[this.sargamNoteIndex % this.SWARAS.length];
    this.sargamNoteIndex = (this.sargamNoteIndex + 1) % this.SWARAS.length;

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.18, now);

    // Main string oscillator (Triangle + subtle sine harmonics)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(targetFreq, now);
    osc2.frequency.setValueAtTime(targetFreq * 2, now);

    if (withMeend) {
      // Gentle microtonal glide
      osc1.frequency.linearRampToValueAtTime(targetFreq * 1.03, now + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.35);
    }

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.8);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.5, now + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.003);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(bus);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.2);
    osc2.stop(now + 1.2);

    this.routeOutput(bus, 0.3);
  }

  /**
   * Tanpura Drone (Gentle acoustic root harmony).
   */
  public playTanpuraDrone(rootFreq: number = 130.81): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.001, now);
    bus.gain.linearRampToValueAtTime(0.12, now + 0.4);
    bus.gain.setValueAtTime(0.12, now + 1.8);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    const pitches = [rootFreq * 1.5, rootFreq * 2]; // Pa, Sa
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now + idx * 0.15);
      osc.stop(now + 3.0);
    });

    this.routeOutput(bus, 0.4);
  }

  /**
   * Paper Tear & Envelope Opening (Gentle tactile rustle).
   */
  public playTear(velocity: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.08 * Math.min(1.2, velocity), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    this.routeOutput(gain, 0.1);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Kalam Reed Pen & Ink Scratch (Intimate tactile nib tap).
   */
  public playKalamScratch(speed: number = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.03);

    gain.gain.setValueAtTime(0.04 * Math.min(1.2, speed), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    this.routeOutput(gain, 0.05);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Resham Thread Knot Cinch (Pleasant tactile snap).
   */
  public playKnot(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    this.routeOutput(gain, 0.15);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Wax Seal Actions (Soft wax thud, stamp or crack).
   */
  public playWaxSeal(action: 'drip' | 'stamp' | 'crack'): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (action === 'stamp') {
      // Warm brass thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.09);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    } else {
      // Crisp wax crack
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    }

    osc.connect(gain);
    this.routeOutput(gain, 0.15);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Akshat (Rice Rain) & Tilak Blessing (Delicate sparkle).
   */
  public playAkshatShower(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const strikeTime = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400 + i * 280, strikeTime);

      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.06, strikeTime + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.04);

      osc.connect(gain);
      this.routeOutput(gain, 0.15);

      osc.start(strikeTime);
      osc.stop(strikeTime + 0.05);
    }
  }

  /**
   * Aarti Bell.
   */
  public playAartiBell(): void {
    this.playMandirGhanti(1.2, 0.8);
  }

  /**
   * Sweet Prasad Offering (Sweet ascending chord).
   */
  public playSweetPrasad(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const triad = [523.25, 659.25, 783.99]; // C5, E5, G5

    triad.forEach((freq, idx) => {
      const noteTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.1, noteTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

      osc.connect(gain);
      this.routeOutput(gain, 0.25);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  /**
   * Antique Peti Box.
   */
  public playPetiBox(action: 'open' | 'close' | 'latch' = 'open'): void {
    if (this.isMuted) return;
    if (action === 'latch') {
      this.playKnot();
    } else {
      this.playMandirGhanti(1.1, 0.7);
    }
  }

  /**
   * UI Click / Tap Feedback.
   */
  public playUIFeedback(type: 'tap' | 'slide' | 'success' = 'tap'): void {
    if (this.isMuted) return;
    if (type === 'success') {
      this.playSweetPrasad();
    } else if (type === 'slide') {
      this.playGhungroo(0.6, 1.2);
    } else {
      this.playKnot();
    }
  }
}

export const audio = new AudioEngine();
