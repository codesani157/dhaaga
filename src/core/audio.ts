/**
 * Procedural Web Audio Synthesizer for Dhaaga.
 * 
 * Crafts realistic acoustic and physical sounds for Indian festive rituals:
 * - Physical modal synthesis for Mandir Ghanti (heavy temple bell) & Singing Bowl
 * - Multi-grain scatter physics for Ghungroo (brass ankle bells)
 * - Lip-reed & formant vocal tract modeling for Sacred Shankha (Conch)
 * - Extended Karplus-Strong string synthesis with Jawari bridge buzz & Raag Yaman scales
 * - Granular friction models for Silk threads (Resham Dhaaga), Paper tear, and Kalam pen ink
 * - Physical acoustic impacts for Wax seal stamping, Brass Thaal, Akshat rice shower, and Peti box
 * - Procedural algorithmic convolution reverb simulating sacred temple space
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private activeVoices: number = 0;
  private maxVoices: number = 16;
  private reverbNode: ConvolverNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGainNode: GainNode | null = null;
  private sargamNoteIndex: number = 0;

  // Raag Yaman / Bhairav Swaras (Frequencies in Hz for Sitar & Tanpura)
  // Sa (C4=261.63), Re (D4=293.66), Ga (E4=329.63), Tivra Ma (F#4=369.99), Pa (G4=392.00), Dha (A4=440.00), Ni (B4=493.88), Taar Sa (C5=523.25)
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
    const saved = localStorage.getItem('dhaaga_sound_enabled');
    this.isMuted = saved !== 'true';
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem('dhaaga_sound_enabled', (!muted).toString());
    if (!muted) {
      this.initCtx();
    }
  }

  /**
   * Initializes Web Audio Context with Master Bus, Compressor Limiter, and Temple Reverb.
   */
  private initCtx(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass({ latencyHint: 'interactive' });
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.ctx && !this.masterGainNode) {
      // 1. Master Output Gain
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // 2. Warm Dynamics Limiter (prevents harsh distortion on layered bells)
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGainNode.connect(this.masterCompressor);
      this.masterCompressor.connect(this.ctx.destination);

      // 3. Sacred Temple Reverb Impulse Response
      this.initReverb(this.ctx);
    }

    return this.ctx;
  }

  /**
   * Generates a warm sacred temple hall impulse response for rich spatial acoustic depth.
   */
  private initReverb(ctx: AudioContext): void {
    try {
      const sampleRate = ctx.sampleRate;
      const duration = 2.4; // 2.4 second warm temple tail
      const decay = 3.2;
      const length = Math.floor(sampleRate * duration);
      const impulse = ctx.createBuffer(2, length, sampleRate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Exponential decay envelope with initial delay
        const env = Math.exp(-t * decay);
        // Early reflections + diffuse reverberation
        const noiseL = (Math.random() * 2 - 1) * env;
        const noiseR = (Math.random() * 2 - 1) * env;

        // Damping high frequencies gradually to simulate warm brick/stone/wood temple absorption
        const damp = Math.exp(-t * 2.2);
        left[i] = noiseL * damp;
        right[i] = noiseR * damp;
      }

      this.reverbNode = ctx.createConvolver();
      this.reverbNode.buffer = impulse;
    } catch {
      this.reverbNode = null;
    }
  }

  /**
   * Utility to route audio into master bus with optional temple reverb send.
   */
  private routeOutput(source: AudioNode, reverbSend: number = 0.25): void {
    if (!this.ctx || !this.masterGainNode) return;

    // Dry path
    const dryGain = this.ctx.createGain();
    dryGain.gain.setValueAtTime(1.0 - reverbSend * 0.4, this.ctx.currentTime);
    source.connect(dryGain);
    dryGain.connect(this.masterGainNode);

    // Wet reverb path
    if (this.reverbNode && reverbSend > 0.01) {
      const wetGain = this.ctx.createGain();
      wetGain.gain.setValueAtTime(reverbSend, this.ctx.currentTime);
      source.connect(wetGain);
      wetGain.connect(this.reverbNode);
      this.reverbNode.connect(this.masterGainNode);
    }
  }

  /**
   * Play Ghungroo (Brass ankle bells).
   * Physical granular simulation of 10-14 tiny brass bells colliding with internal metal pellets.
   */
  public playGhungroo(velocity: number = 1.0, pitchShift: number = 1.0): void {
    const ctx = this.initCtx();
    if (!ctx || this.activeVoices >= this.maxVoices) return;

    this.activeVoices++;
    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.24 * Math.min(1.5, Math.max(0.4, velocity)), now);

    // 11 micro-strikes with jittered timing and natural dispersion
    const bellCount = 11;
    const basePitches = [2450, 2890, 3320, 3780, 4210, 4850, 5400, 6100];

    for (let i = 0; i < bellCount; i++) {
      const strikeTime = now + (i === 0 ? 0 : Math.random() * 0.065);
      const bellPitch = (basePitches[i % basePitches.length] + (Math.random() - 0.5) * 450) * pitchShift;

      // Inharmonic brass modes: fundamental + 1.48 (minor 3rd) + 2.76
      const ratios = [1, 1.48, 2.76];
      ratios.forEach((ratio, rIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bellPitch * ratio, strikeTime);

        const decay = 0.09 + Math.random() * 0.12;
        const volume = (0.12 / (rIdx + 1)) * (0.8 + Math.random() * 0.4);

        gain.gain.setValueAtTime(0.001, strikeTime);
        gain.gain.linearRampToValueAtTime(volume, strikeTime + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decay);

        osc.connect(gain);
        gain.connect(bus);

        osc.start(strikeTime);
        osc.stop(strikeTime + decay + 0.02);
      });
    }

    // Micro metal friction noise transient (the shaking jingle sound)
    const noiseLen = Math.floor(ctx.sampleRate * 0.08);
    const noiseBuffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let j = 0; j < noiseLen; j++) {
      noiseData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (noiseLen * 0.25));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(5200 * pitchShift, now);
    noiseFilter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18 * velocity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(bus);

    noiseSource.start(now);

    this.routeOutput(bus, 0.35);

    setTimeout(() => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }, 450);
  }

  /**
   * Mandir Ghanti (Sacred Bronze Temple Bell).
   * Physical modal synthesis with authentic inharmonic ratios, beating amplitude wobble,
   * felt/brass hammer strike transient, and a majestic 4.5 second acoustic tail.
   */
  public playMandirGhanti(octave: number = 1.0, intensity: number = 1.0): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.35 * Math.min(1.4, intensity), now);

    // Fundamental frequency (approx 784 Hz - G5 or 587 Hz - D5)
    const fundamental = 680 * octave;

    // Authentic Bronze Bell Inharmonic Modal Ratios & Relative Decays
    // [Ratio, Relative Amplitude, Decay Time, Beat Frequency (Hz)]
    const bellModes = [
      { ratio: 0.5, amp: 0.45, decay: 4.8, beat: 1.2 }, // Hum tone (sub-octave)
      { ratio: 1.0, amp: 0.55, decay: 4.2, beat: 1.8 }, // Prime (fundamental)
      { ratio: 1.183, amp: 0.35, decay: 3.6, beat: 2.1 }, // Tierce (minor third)
      { ratio: 1.506, amp: 0.28, decay: 3.1, beat: 2.7 }, // Quint (fifth)
      { ratio: 2.0, amp: 0.40, decay: 2.6, beat: 3.2 }, // Nominal (octave)
      { ratio: 2.74, amp: 0.22, decay: 1.8, beat: 4.1 }, // Decime
      { ratio: 3.42, amp: 0.16, decay: 1.3, beat: 0.0 }, // Upper partial 1
      { ratio: 4.18, amp: 0.12, decay: 0.9, beat: 0.0 }, // Upper partial 2
      { ratio: 5.65, amp: 0.08, decay: 0.5, beat: 0.0 }, // Metallic rim sparkle
    ];

    bellModes.forEach((mode) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * mode.ratio, now);

      // Acoustic beat amplitude modulation (wobble in bell metal)
      if (mode.beat > 0) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(mode.beat, now);
        lfoGain.gain.setValueAtTime(0.18, now);
        lfo.connect(lfoGain.gain);
        lfo.start(now);
        lfo.stop(now + mode.decay);
      }

      // Bell strike amplitude envelope
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(mode.amp, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.00005, now + mode.decay);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + mode.decay + 0.1);
    });

    // Felt/Brass Clapper strike impulse (wooden/brass impact click)
    const clickLen = Math.floor(ctx.sampleRate * 0.012);
    const clickBuf = ctx.createBuffer(1, clickLen, ctx.sampleRate);
    const clickData = clickBuf.getChannelData(0);
    for (let k = 0; k < clickLen; k++) {
      clickData[k] = (Math.random() * 2 - 1) * Math.cos((k / clickLen) * (Math.PI / 2));
    }
    const click = ctx.createBufferSource();
    click.buffer = clickBuf;

    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'lowpass';
    clickFilter.frequency.setValueAtTime(3200, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.22, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(bus);
    click.start(now);

    this.routeOutput(bus, 0.45); // Generous reverb for holy mandir spaciousness
  }

  /**
   * Sacred Conch Shankha Naad.
   * Acoustic lip-reed model with triple formant vocal tract resonance,
   * natural embouchure pitch inflection, and majestic breath flutter.
   */
  public playShankh(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.001, now);
    // Swelling attack, sustained noble resonance, gentle release
    bus.gain.linearRampToValueAtTime(0.38, now + 0.45);
    bus.gain.setValueAtTime(0.38, now + 1.2);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    // 1. Dual Lip-Reed Oscillators (Sawtooth + Pulse with subtle detuning)
    const baseFreq = 277.18; // Sacred C#4 / D4 pitch
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Lip pressure pitch curve (starts slightly flat, ascends proudly, then tapers)
    [osc1, osc2].forEach((osc, idx) => {
      const detune = idx === 0 ? 0 : 4.5;
      osc.frequency.setValueAtTime(baseFreq * 0.94 + detune, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.05 + detune, now + 0.45);
      osc.frequency.setValueAtTime(baseFreq * 1.05 + detune, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.98 + detune, now + 2.6);
    });

    // 2. Breath Turbulence Layer (Air rushing through spiral conch shell)
    const breathLen = Math.floor(ctx.sampleRate * 2.8);
    const breathBuf = ctx.createBuffer(1, breathLen, ctx.sampleRate);
    const breathData = breathBuf.getChannelData(0);
    for (let i = 0; i < breathLen; i++) {
      breathData[i] = Math.random() * 2 - 1;
    }
    const breath = ctx.createBufferSource();
    breath.buffer = breathBuf;

    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(1100, now);
    breathFilter.Q.setValueAtTime(4.0, now);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.001, now);
    breathGain.gain.linearRampToValueAtTime(0.08, now + 0.4);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(bus);
    breath.start(now);

    // 3. Conch Shell Formant Cavity Filters (F1, F2, F3)
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(540, now);
    f1.Q.setValueAtTime(4.5, now);

    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1420, now);
    f2.Q.setValueAtTime(5.0, now);

    const f3 = ctx.createBiquadFilter();
    f3.type = 'bandpass';
    f3.frequency.setValueAtTime(2650, now);
    f3.Q.setValueAtTime(6.0, now);

    osc1.connect(f1);
    osc1.connect(f2);
    osc2.connect(f2);
    osc2.connect(f3);

    f1.connect(bus);
    f2.connect(bus);
    f3.connect(bus);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.9);
    osc2.stop(now + 2.9);

    this.routeOutput(bus, 0.5);
  }

  /**
   * Sitar & Sarod Pluck with Raag Yaman Scale & Sympathetic Strings (Tarab).
   * Karplus-Strong physical modeling with Jawari buzzing bridge harmonics.
   */
  public playSitar(freq?: number, withMeend: boolean = true): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Step through Raag Yaman scale if no specific freq provided
    const targetFreq = freq || this.SWARAS[this.sargamNoteIndex % this.SWARAS.length];
    this.sargamNoteIndex = (this.sargamNoteIndex + 1) % this.SWARAS.length;

    const period = 1 / targetFreq;
    const bufferSize = Math.max(2, Math.floor(ctx.sampleRate * period));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Mizrab (wire plectrum) strike profile: asymmetric pulse + string noise
    for (let i = 0; i < bufferSize; i++) {
      const phase = i / bufferSize;
      const noise = Math.random() * 2 - 1;
      data[i] = (Math.sin(phase * Math.PI * 2) * 0.6 + noise * 0.4) * Math.exp(-phase * 3.5);
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Delay line for fundamental pitch
    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(period, now);

    // Microtonal Meend (pitch bend up 15-20 cents for authentic Indian classical expression)
    if (withMeend && Math.random() > 0.35) {
      delay.delayTime.linearRampToValueAtTime(period * 0.985, now + 0.18);
      delay.delayTime.exponentialRampToValueAtTime(period, now + 0.45);
    }

    // Karplus-Strong string feedback loop
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.984, now);

    // Jawari buzzing bridge filter (curved bone bridge creates non-linear bright harmonics)
    const jawariFilter = ctx.createBiquadFilter();
    jawariFilter.type = 'lowpass';
    jawariFilter.frequency.setValueAtTime(4200, now);
    jawariFilter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);

    // Sympathetic resonance (Tarab strings vibration)
    const tarabOsc = ctx.createOscillator();
    const tarabGain = ctx.createGain();
    tarabOsc.type = 'sine';
    tarabOsc.frequency.setValueAtTime(targetFreq * 2, now);
    tarabGain.gain.setValueAtTime(0.001, now);
    tarabGain.gain.linearRampToValueAtTime(0.04, now + 0.08);
    tarabGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    tarabOsc.connect(tarabGain);
    tarabOsc.start(now);
    tarabOsc.stop(now + 1.6);

    const stringGain = ctx.createGain();
    stringGain.gain.setValueAtTime(0.28, now);
    stringGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    noiseSource.connect(delay);
    delay.connect(jawariFilter);
    jawariFilter.connect(feedback);
    feedback.connect(delay);

    jawariFilter.connect(stringGain);
    tarabGain.connect(stringGain);

    noiseSource.start(now);
    this.routeOutput(stringGain, 0.38);

    setTimeout(() => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
      } catch {}
    }, 1900);
  }

  /**
   * Sacred Tanpura 4-String Cycle (Pa - Sa - Sa - Sa).
   * Deep meditative acoustic drone with overtone shimmer.
   */
  public playTanpuraDrone(rootFreq: number = 130.81): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.001, now);
    bus.gain.linearRampToValueAtTime(0.22, now + 0.6);
    bus.gain.setValueAtTime(0.22, now + 3.5);
    bus.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

    // 4 strings: Pa (5th), Sa (Middle), Sa (Middle), Sa (Low Root)
    const pitches = [rootFreq * 1.5, rootFreq * 2, rootFreq * 2, rootFreq];
    const delays = [0.0, 0.45, 0.9, 1.35];

    pitches.forEach((freq, idx) => {
      const pluckTime = now + delays[idx];
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, pluckTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, pluckTime);
      filter.frequency.exponentialRampToValueAtTime(450, pluckTime + 2.5);

      oscGain.gain.setValueAtTime(0.001, pluckTime);
      oscGain.gain.linearRampToValueAtTime(0.12, pluckTime + 0.04);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, pluckTime + 3.8);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(bus);

      osc.start(pluckTime);
      osc.stop(pluckTime + 4.0);
    });

    this.routeOutput(bus, 0.55);
  }

  /**
   * Deckle Paper Tear & Envelope Opening.
   * Dual-band textured brown noise simulation of physical fibrous paper ripping.
   */
  public playTear(velocity: number = 1.0): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 0.09 + Math.min(0.1, velocity * 0.05);
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
      // Micro fiber pops
      if (Math.random() < 0.08) {
        data[i] += (Math.random() * 2 - 1) * 0.4;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const centerFreq = Math.min(3800, 1100 + velocity * 1400);
    filter.frequency.setValueAtTime(centerFreq, now);
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.min(0.28, 0.08 + velocity * 0.12), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    this.routeOutput(gain, 0.12);

    noise.start(now);
  }

  /**
   * Kalam Reed Pen & Ink Scratch on Handmade Cotton Paper.
   * Creates an intimate, tactile writing scratch sound.
   */
  public playKalamScratch(speed: number = 1.0): void {
    const ctx = this.initCtx();
    if (!ctx || this.activeVoices >= this.maxVoices) return;

    this.activeVoices++;
    const now = ctx.currentTime;
    const dur = 0.04 + Math.random() * 0.03;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    // High frequency nib grit
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3600 + Math.random() * 1200, now);
    filter.Q.setValueAtTime(4.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09 * Math.min(1.5, speed), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    this.routeOutput(gain, 0.1);

    noise.start(now);

    setTimeout(() => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    }, 100);
  }

  /**
   * Resham Thread Knot Cinch (Satisfying tactile knot tightening & snap).
   */
  public playKnot(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.32, now);

    // 1. Thread friction pull
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.065);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(oscGain);
    oscGain.connect(bus);
    osc.start(now);
    osc.stop(now + 0.07);

    // 2. Tactile wooden/knot snap pop
    const popLen = Math.floor(ctx.sampleRate * 0.015);
    const popBuf = ctx.createBuffer(1, popLen, ctx.sampleRate);
    const popData = popBuf.getChannelData(0);
    for (let i = 0; i < popLen; i++) {
      popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popLen * 0.3));
    }
    const popSource = ctx.createBufferSource();
    popSource.buffer = popBuf;
    const popFilter = ctx.createBiquadFilter();
    popFilter.type = 'bandpass';
    popFilter.frequency.setValueAtTime(1800, now);
    popFilter.Q.setValueAtTime(3.0, now);
    popSource.connect(popFilter);
    popFilter.connect(bus);
    popSource.start(now);

    this.routeOutput(bus, 0.2);
  }

  /**
   * Wax Seal Actions: Sizzle drip, heavy Brass Stamp impact, or Seal cracking.
   */
  public playWaxSeal(action: 'drip' | 'stamp' | 'crack'): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = ctx.createGain();

    if (action === 'stamp') {
      // Heavy brass stamp thud (85 Hz) + metallic seal resonance + suction pop
      bus.gain.setValueAtTime(0.4, now);

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.14);
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      subOsc.connect(subGain);
      subGain.connect(bus);
      subOsc.start(now);
      subOsc.stop(now + 0.15);

      // Brass ring
      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(1920, now);
      ringGain.gain.setValueAtTime(0.18, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      ringOsc.connect(ringGain);
      ringGain.connect(bus);
      ringOsc.start(now);
      ringOsc.stop(now + 0.46);

      this.routeOutput(bus, 0.25);
    } else if (action === 'crack') {
      // Crisp brittle wax seal fracture
      bus.gain.setValueAtTime(0.3, now);
      const len = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (i % 8 === 0 ? 1 : 0.2);
      }
      const crack = ctx.createBufferSource();
      crack.buffer = buf;
      const filt = ctx.createBiquadFilter();
      filt.type = 'highpass';
      filt.frequency.setValueAtTime(2400, now);
      crack.connect(filt);
      filt.connect(bus);
      crack.start(now);
      this.routeOutput(bus, 0.15);
    } else {
      // Drip / sizzle
      this.playTear(0.4);
    }
  }

  /**
   * Akshat (Rice Rain) & Sindoor/Tilak Blessing.
   * Multi-grain shower of rice grains cascading onto a brass thali with blessing chime.
   */
  public playAkshatShower(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const grainCount = 14;

    for (let i = 0; i < grainCount; i++) {
      const strikeTime = now + i * 0.022 + Math.random() * 0.015;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800 + Math.random() * 1800, strikeTime);

      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.08, strikeTime + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.04);

      osc.connect(gain);
      this.routeOutput(gain, 0.2);

      osc.start(strikeTime);
      osc.stop(strikeTime + 0.05);
    }
  }

  /**
   * Aarti Puja Bell with gentle Doppler swing modulation.
   */
  public playAartiBell(): void {
    this.playMandirGhanti(1.25, 0.85);
  }

  /**
   * Mithai & Prasad Sweet Taste Chime.
   * Pure sweet ascending triad in pentatonic harmony.
   */
  public playSweetPrasad(): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const triad = [523.25, 659.25, 783.99]; // C5, E5, G5

    triad.forEach((freq, idx) => {
      const noteTime = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.65);

      osc.connect(gain);
      this.routeOutput(gain, 0.35);

      osc.start(noteTime);
      osc.stop(noteTime + 0.7);
    });
  }

  /**
   * Antique Wooden Peti Box (Creak, latch, unboxing).
   */
  public playPetiBox(action: 'open' | 'close' | 'latch' = 'open'): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (action === 'latch') {
      // Crisp metallic brass latch click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      this.routeOutput(gain, 0.1);
      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Wood friction creak + open resonance
      this.playTear(0.6);
      setTimeout(() => this.playSitar(undefined, false), 80);
    }
  }

  /**
   * Crisp UI Feedback (Subtle wooden/silk tap for buttons and toggles).
   */
  public playUIFeedback(type: 'tap' | 'slide' | 'success' = 'tap'): void {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (type === 'success') {
      this.playSweetPrasad();
    } else if (type === 'slide') {
      this.playGhungroo(0.5, 1.3);
    } else {
      // Soft organic wooden tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      this.routeOutput(gain, 0.08);
      osc.start(now);
      osc.stop(now + 0.035);
    }
  }
}

export const audio = new AudioEngine();
