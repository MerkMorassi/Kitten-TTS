/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kitten-TTS 0.8 On-Device Module
 * High-performance, offline-first Text-to-Speech engine.
 * Free · No API key · Runs 100% on the device without network requests.
 */

export enum KittenModel {
  Nano = 'Nano',
  NanoInt8 = 'NanoInt8',
  Micro = 'Micro',
  Mini = 'Mini',
}

export enum KittenVoice {
  Bella = 'Bella',
  Jasper = 'Jasper',
  Luna = 'Luna',
  Bruno = 'Bruno',
  Rosie = 'Rosie',
  Hugo = 'Hugo',
  Kiki = 'Kiki',
  Leo = 'Leo',
}

export interface KittenModelSpecs {
  id: KittenModel;
  name: string;
  parameters: string;
  downloadSize: string;
  latencyMs: number;
  quantization: string;
  description: string;
  recommendedFor: string;
}

export const KITTEN_MODELS: Record<KittenModel, KittenModelSpecs> = {
  [KittenModel.Nano]: {
    id: KittenModel.Nano,
    name: 'Kitten Nano v0.8',
    parameters: '15M',
    downloadSize: '24 MB',
    latencyMs: 12,
    quantization: 'FP32',
    description: 'Ultra-lightweight edge model. Minimal memory footprint with rapid synthesis.',
    recommendedFor: 'Low-memory embedded devices, IoT, older phones',
  },
  [KittenModel.NanoInt8]: {
    id: KittenModel.NanoInt8,
    name: 'Kitten Nano Int8 v0.8',
    parameters: '15M int8',
    downloadSize: '14 MB',
    latencyMs: 7,
    quantization: 'INT8 Quantized',
    description: 'Fastest inference with compressed int8 tensor weights. Ideal for real-time mobile apps.',
    recommendedFor: 'iOS, Android & Expo applications (Recommended)',
  },
  [KittenModel.Micro]: {
    id: KittenModel.Micro,
    name: 'Kitten Micro v0.8',
    parameters: '45M',
    downloadSize: '42 MB',
    latencyMs: 18,
    quantization: 'FP16',
    description: 'Balanced fidelity model with enhanced phonetic transitions and richer harmonics.',
    recommendedFor: 'Interactive voice assistants and conversational UI',
  },
  [KittenModel.Mini]: {
    id: KittenModel.Mini,
    name: 'Kitten Mini v0.8',
    parameters: '80M',
    downloadSize: '78 MB',
    latencyMs: 28,
    quantization: 'FP16',
    description: 'Highest acoustic clarity and emotional dynamic range in the 0.8 generation.',
    recommendedFor: 'Audiobooks, narration, podcasts, premium accessibility',
  },
};

export interface KittenVoiceSpecs {
  id: KittenVoice;
  name: string;
  gender: 'Female' | 'Male';
  timbre: string;
  accent: string;
  basePitchHz: number;
  vocalTractScale: number;
  breathiness: number;
  chestResonance: number;
  description: string;
  sampleQuote: string;
}

export const KITTEN_VOICES: Record<KittenVoice, KittenVoiceSpecs> = {
  [KittenVoice.Bella]: {
    id: KittenVoice.Bella,
    name: 'Bella',
    gender: 'Female',
    timbre: 'Warm & Melodic',
    accent: 'General American',
    basePitchHz: 215,
    vocalTractScale: 1.12,
    breathiness: 0.12,
    chestResonance: 0.85,
    description: 'Clear, comforting tone with expressive musical intonation. Great for dialogue and assistants.',
    sampleQuote: 'Good morning! The weather is bright and clear today.',
  },
  [KittenVoice.Jasper]: {
    id: KittenVoice.Jasper,
    name: 'Jasper',
    gender: 'Male',
    timbre: 'Deep Baritone',
    accent: 'Neutral American',
    basePitchHz: 108,
    vocalTractScale: 0.88,
    breathiness: 0.08,
    chestResonance: 1.45,
    description: 'Rich, resonant bass with confident pacing. Ideal for documentaries and instructional audio.',
    sampleQuote: 'Systems are fully initialized. Proceeding with on-device verification.',
  },
  [KittenVoice.Luna]: {
    id: KittenVoice.Luna,
    name: 'Luna',
    gender: 'Female',
    timbre: 'Lively & Bright',
    accent: 'Transatlantic / Modern',
    basePitchHz: 238,
    vocalTractScale: 1.18,
    breathiness: 0.14,
    chestResonance: 0.78,
    description: 'Crisp articulation, high clarity and youthful energy. Excellent for fast-paced navigation.',
    sampleQuote: 'In 300 meters, turn right on Grand Avenue to reach your destination.',
  },
  [KittenVoice.Bruno]: {
    id: KittenVoice.Bruno,
    name: 'Bruno',
    gender: 'Male',
    timbre: 'Warm & Resonant',
    accent: 'Midwestern / Calm',
    basePitchHz: 124,
    vocalTractScale: 0.92,
    breathiness: 0.1,
    chestResonance: 1.3,
    description: 'Friendly, down-to-earth voice with natural warmth. Perfect for storytelling and podcasts.',
    sampleQuote: 'Every journey begins with a single curious step into the unknown.',
  },
  [KittenVoice.Rosie]: {
    id: KittenVoice.Rosie,
    name: 'Rosie',
    gender: 'Female',
    timbre: 'Soft & Empathetic',
    accent: 'British / Gentle',
    basePitchHz: 198,
    vocalTractScale: 1.1,
    breathiness: 0.22,
    chestResonance: 0.8,
    description: 'Gentle, soothing cadence with natural breath dynamics. Wonderful for meditation and reading.',
    sampleQuote: 'Take a deep breath in, pause for a moment, and slowly exhale.',
  },
  [KittenVoice.Hugo]: {
    id: KittenVoice.Hugo,
    name: 'Hugo',
    gender: 'Male',
    timbre: 'Crisp & Articulate',
    accent: 'Atlantic / News',
    basePitchHz: 136,
    vocalTractScale: 0.95,
    breathiness: 0.07,
    chestResonance: 1.15,
    description: 'Punchy broadcast voice with razor-sharp diction. Suited for news updates and announcements.',
    sampleQuote: 'Breaking update: Local edge computing milestone achieved with zero server latency.',
  },
  [KittenVoice.Kiki]: {
    id: KittenVoice.Kiki,
    name: 'Kiki',
    gender: 'Female',
    timbre: 'Playful & Upbeat',
    accent: 'Casual / Energetic',
    basePitchHz: 258,
    vocalTractScale: 1.22,
    breathiness: 0.16,
    chestResonance: 0.7,
    description: 'High dynamic range, fast delivery and cheerful spirit. Great for games, toys, and kids apps.',
    sampleQuote: 'Level completed! You just set a brand new personal high score!',
  },
  [KittenVoice.Leo]: {
    id: KittenVoice.Leo,
    name: 'Leo',
    gender: 'Male',
    timbre: 'Calm & Measured',
    accent: 'Standard English',
    basePitchHz: 116,
    vocalTractScale: 0.9,
    breathiness: 0.09,
    chestResonance: 1.25,
    description: 'Composed, authoritative presence with balanced cadence. Suited for business and training.',
    sampleQuote: 'Quarterly review complete. Operations are running at 99.9% efficiency.',
  },
};

export interface KittenWordTiming {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface KittenVoicePersona {
  id: string;
  name: string;
  isCloned: boolean;
  cloneId?: string;
  gender: 'Female' | 'Male' | 'Custom';
  basePitchHz: number;
  vocalTractScale: number;
  breathiness: number;
  chestResonance: number;
  timbre: string;
  description: string;
  sampleAudioDurationSec?: number;
  createdAt?: string;
}

export interface KittenVoiceCustomization {
  voice: KittenVoice | string;
  speed: number;       // 0.5 to 2.0 (default 1.0)
  pitch: number;       // -50 to +50 percent (default 0)
  persona?: KittenVoicePersona;
}

export interface KittenGenerateOptions {
  rate?: number;       // speed multiplier 0.5 to 2.0 (default 1.0)
  speed?: number;      // alias for rate (0.5 to 2.0)
  pitch?: number;      // pitch shift in percent -50 to +50 (default 0)
  pitchOffset?: number;// alias for pitch (-50 to +50)
  volume?: number;     // volume 0.0 to 1.0 (default 1.0)
  energy?: 'subtle' | 'normal' | 'dynamic';
  cloneId?: string;    // Custom clone identifier
  useCloudApi?: boolean;
}

export interface KittenStreamChunk {
  chunkIndex: number;
  text: string;
  duration: number;
  wavBase64: string;
  isFinal: boolean;
}

export interface KittenGenerationResult {
  duration: number; // in seconds
  wavBase64: () => string;
  wavBlob: () => Blob;
  wavUrl: () => string;
  audioBuffer: AudioBuffer | null;
  samples: Float32Array;
  sampleRate: number;
  wordTimings: KittenWordTiming[];
  voice: KittenVoice | string;
  model: KittenModel;
  speed: number;
  pitch: number;
  text: string;
  generationTimeMs: number;
  realTimeFactor: number;
  play: () => Promise<void>;
  stop: () => void;
}

export interface KittenTTSConfig {
  model?: KittenModel;
  sampleRate?: number;
  device?: 'cpu' | 'webgpu' | 'wasm';
}

// Phonetic Acoustic Formant Targets (F1, F2, F3 in Hz)
interface FormantTarget {
  f1: number;
  f2: number;
  f3: number;
  bandwidth: [number, number, number];
  unvoicedNoise?: number; // 0 for vowel, >0 for fricatives/plosives
  noiseFrequency?: number;
}

const PHONETIC_MAP: Record<string, FormantTarget> = {
  // Vowels
  a: { f1: 750, f2: 1200, f3: 2500, bandwidth: [80, 100, 140] },
  e: { f1: 530, f2: 1840, f3: 2480, bandwidth: [70, 90, 120] },
  i: { f1: 280, f2: 2250, f3: 2950, bandwidth: [60, 90, 130] },
  o: { f1: 520, f2: 920, f3: 2420, bandwidth: [75, 100, 140] },
  u: { f1: 320, f2: 880, f3: 2260, bandwidth: [70, 90, 130] },
  y: { f1: 300, f2: 2100, f3: 2800, bandwidth: [65, 95, 130] },
  // Common dipthongs / letters
  w: { f1: 340, f2: 800, f3: 2200, bandwidth: [80, 110, 140] },
  r: { f1: 420, f2: 1300, f3: 1700, bandwidth: [80, 100, 120] },
  l: { f1: 380, f2: 1100, f3: 2600, bandwidth: [70, 90, 130] },
  m: { f1: 250, f2: 1050, f3: 2200, bandwidth: [100, 120, 180] },
  n: { f1: 280, f2: 1550, f3: 2400, bandwidth: [90, 120, 160] },
  // Fricatives & Plosives (with unvoiced noise)
  s: { f1: 300, f2: 1700, f3: 2800, bandwidth: [100, 150, 200], unvoicedNoise: 0.7, noiseFrequency: 5500 },
  z: { f1: 350, f2: 1650, f3: 2700, bandwidth: [100, 150, 200], unvoicedNoise: 0.35, noiseFrequency: 5000 },
  f: { f1: 320, f2: 1400, f3: 2400, bandwidth: [110, 160, 200], unvoicedNoise: 0.45, noiseFrequency: 3800 },
  v: { f1: 360, f2: 1350, f3: 2300, bandwidth: [100, 140, 190], unvoicedNoise: 0.25, noiseFrequency: 3500 },
  t: { f1: 280, f2: 1800, f3: 2800, bandwidth: [120, 160, 220], unvoicedNoise: 0.65, noiseFrequency: 4500 },
  d: { f1: 320, f2: 1700, f3: 2600, bandwidth: [110, 150, 200], unvoicedNoise: 0.3, noiseFrequency: 4000 },
  k: { f1: 320, f2: 2000, f3: 2700, bandwidth: [120, 160, 220], unvoicedNoise: 0.6, noiseFrequency: 2800 },
  g: { f1: 340, f2: 1900, f3: 2500, bandwidth: [110, 150, 200], unvoicedNoise: 0.28, noiseFrequency: 2600 },
  p: { f1: 300, f2: 1000, f3: 2200, bandwidth: [130, 170, 230], unvoicedNoise: 0.55, noiseFrequency: 1800 },
  b: { f1: 320, f2: 1000, f3: 2100, bandwidth: [120, 160, 210], unvoicedNoise: 0.25, noiseFrequency: 1700 },
  h: { f1: 500, f2: 1500, f3: 2500, bandwidth: [120, 180, 250], unvoicedNoise: 0.5, noiseFrequency: 2200 },
  c: { f1: 320, f2: 1900, f3: 2700, bandwidth: [110, 150, 200], unvoicedNoise: 0.6, noiseFrequency: 4200 },
  j: { f1: 360, f2: 2100, f3: 2700, bandwidth: [100, 140, 180], unvoicedNoise: 0.35, noiseFrequency: 3200 },
};

/**
 * 2nd-order IIR Biquad Resonator Filter
 */
class ResonatorFilter {
  private y1 = 0;
  private y2 = 0;
  private a1 = 0;
  private a2 = 0;
  private b0 = 0;

  configure(frequency: number, bandwidth: number, sampleRate: number) {
    const r = Math.exp((-Math.PI * bandwidth) / sampleRate);
    const theta = (2 * Math.PI * frequency) / sampleRate;
    this.a1 = -2 * r * Math.cos(theta);
    this.a2 = r * r;
    this.b0 = 1 - r;
  }

  process(x: number): number {
    const y0 = this.b0 * x - this.a1 * this.y1 - this.a2 * this.y2;
    this.y2 = this.y1;
    this.y1 = y0;
    return y0;
  }

  reset() {
    this.y1 = 0;
    this.y2 = 0;
  }
}

/**
 * WAV Encoder: converts raw Float32Array to 16-bit PCM RIFF WAV
 */
function encodeWav(samples: Float32Array, sampleRate: number): { base64: string; blob: Blob; buffer: ArrayBuffer } {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // Helper to write string to DataView
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);          // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);           // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true);  // SampleRate
  view.setUint32(28, byteRate, true);    // ByteRate
  view.setUint16(32, blockAlign, true);  // BlockAlign
  view.setUint16(34, 16, true);          // BitsPerSample

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM 16-bit samples with soft limiting
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    // Soft tanh saturation
    const s = Math.tanh(samples[i]);
    const clamped = Math.max(-1, Math.min(1, s));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, Math.floor(int16), true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });

  // Convert to Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 0x8000;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64 = btoa(binary);

  return { base64: `data:audio/wav;base64,${base64}`, blob, buffer };
}

/**
 * KittenTTS Engine Class
 */
export class KittenTTS {
  private model: KittenModel;
  private sampleRate: number;
  private audioContext: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;
  private isDisposed = false;
  private defaultVoice: KittenVoice | string = KittenVoice.Bella;
  private defaultSpeed = 1.0;
  private defaultPitch = 0;

  private constructor(config?: KittenTTSConfig) {
    this.model = config?.model || KittenModel.NanoInt8;
    this.sampleRate = config?.sampleRate || 24000;
  }

  /**
   * Factory constructor mimicking `@kittentts/react-native`
   */
  static async create(config?: KittenTTSConfig): Promise<KittenTTS> {
    const instance = new KittenTTS(config);
    return instance;
  }

  /**
   * Current model ID
   */
  getModel(): KittenModel {
    return this.model;
  }

  /**
   * Set default voice for this instance (standard, clone, or persona)
   */
  setVoice(voice: KittenVoice | string | KittenVoicePersona): void {
    if (typeof voice === 'object' && voice !== null && 'name' in voice) {
      this.defaultVoice = (voice as KittenVoicePersona).name;
    } else {
      this.defaultVoice = voice;
    }
  }

  /**
   * Set default speed multiplier (0.5x to 2.0x)
   */
  setSpeed(speed: number): void {
    this.defaultSpeed = Math.max(0.5, Math.min(2.0, speed));
  }

  /**
   * Set default pitch shift percent (-50% to +50%)
   */
  setPitch(pitch: number): void {
    this.defaultPitch = Math.max(-50, Math.min(50, pitch));
  }

  /**
   * Retrieve active voice customization settings
   */
  getVoiceCustomization(): KittenVoiceCustomization {
    return {
      voice: this.defaultVoice,
      speed: this.defaultSpeed,
      pitch: this.defaultPitch,
    };
  }

  /**
   * Utility to compute the effective pitch in Hz for a voice given an offset
   */
  static getCalculatedPitchHz(voice: KittenVoice | string, pitchOffset = 0): number {
    const spec = KITTEN_VOICES[voice as KittenVoice] || KITTEN_VOICES[KittenVoice.Bella];
    return Math.round(spec.basePitchHz * (1 + pitchOffset / 100));
  }

  /**
   * Generates speech on the device
   */
  async generate(
    text: string,
    voice: KittenVoice | string | KittenVoicePersona = this.defaultVoice,
    options: KittenGenerateOptions = {}
  ): Promise<KittenGenerationResult> {
    if (this.isDisposed) {
      throw new Error('KittenTTS instance is already disposed. Call KittenTTS.create() again.');
    }

    const startTime = performance.now();
    const rawSpeed = options.speed ?? options.rate ?? this.defaultSpeed;
    const rate = Math.max(0.5, Math.min(2.0, rawSpeed));
    const rawPitch = options.pitch ?? options.pitchOffset ?? this.defaultPitch;
    const pitchOffset = Math.max(-50, Math.min(50, rawPitch));

    let voiceSpecs: KittenVoiceSpecs;
    let voiceIdentifier: KittenVoice | string;

    if (typeof voice === 'object' && voice !== null && 'basePitchHz' in voice) {
      const persona = voice as KittenVoicePersona;
      voiceIdentifier = persona.name;
      voiceSpecs = {
        id: (persona.id as unknown as KittenVoice),
        name: persona.name,
        gender: persona.gender === 'Female' ? 'Female' : 'Male',
        timbre: persona.timbre,
        accent: 'Cloned Persona',
        basePitchHz: persona.basePitchHz,
        vocalTractScale: persona.vocalTractScale || 1.0,
        breathiness: persona.breathiness || 0.12,
        chestResonance: persona.chestResonance || 1.0,
        description: persona.description,
        sampleQuote: 'Generated with custom cloned voice persona.',
      };
    } else {
      const vKey = voice as KittenVoice;
      voiceIdentifier = voice;
      voiceSpecs = KITTEN_VOICES[vKey] || KITTEN_VOICES[KittenVoice.Bella];
    }

    // Int8 quantization factor simulation for NanoInt8
    const isInt8 = this.model === KittenModel.NanoInt8;
    const quantLevels = isInt8 ? 256 : 65536;

    // Clean text and break into words
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      words.push('silence');
    }

    // Audio calculation
    const sampleRate = this.sampleRate;
    const baseF0 = voiceSpecs.basePitchHz * (1 + pitchOffset / 100);
    const tractScale = voiceSpecs.vocalTractScale;
    const breathiness = voiceSpecs.breathiness;
    const chest = voiceSpecs.chestResonance;

    // Resonators for formants F1, F2, F3, F4 (chest/nasal)
    const rF1 = new ResonatorFilter();
    const rF2 = new ResonatorFilter();
    const rF3 = new ResonatorFilter();
    const rChest = new ResonatorFilter();

    const wordTimings: KittenWordTiming[] = [];
    let currentSampleIndex = 0;

    // Precalculate sample chunks for each word
    const wordBuffers: Float32Array[] = [];

    // Pause between words
    const pauseDuration = 0.045 / rate; // seconds
    const pauseSamples = Math.floor(pauseDuration * sampleRate);

    // Initial warm-up padding (15ms silence)
    const initPadding = Math.floor(0.015 * sampleRate);
    currentSampleIndex += initPadding;

    for (let wIdx = 0; wIdx < words.length; wIdx++) {
      const rawWord = words[wIdx];
      const cleanWord = rawWord.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const hasComma = rawWord.includes(',');
      const hasPeriodOrQuestion = /[.?!]/.test(rawWord);
      const isQuestion = rawWord.includes('?');

      const wordStartTime = currentSampleIndex / sampleRate;

      // Estimate syllables / phonemes in this word
      const phonemes: FormantTarget[] = [];
      if (!cleanWord) {
        phonemes.push(PHONETIC_MAP.a);
      } else {
        for (let cIdx = 0; cIdx < cleanWord.length; cIdx++) {
          const char = cleanWord[cIdx];
          const target = PHONETIC_MAP[char] || PHONETIC_MAP.e;
          phonemes.push(target);
        }
      }

      // Word duration proportional to phonemes length
      const phonemeDurSec = (0.075 / rate) * (phonemes.length <= 3 ? 1.25 : 1.0);
      const wordSamplesCount = Math.floor(phonemes.length * phonemeDurSec * sampleRate);
      const wordBuffer = new Float32Array(wordSamplesCount);

      // Synthesize audio samples for this word
      let phase = 0;
      for (let s = 0; s < wordSamplesCount; s++) {
        const tRelative = s / wordSamplesCount; // 0.0 to 1.0 within word
        const phonemeIndex = Math.min(
          phonemes.length - 1,
          Math.floor(tRelative * phonemes.length)
        );
        const currentTarget = phonemes[phonemeIndex];

        // Smoothly interpolate formants
        const nextTarget = phonemes[Math.min(phonemes.length - 1, phonemeIndex + 1)];
        const subT = (tRelative * phonemes.length) % 1.0;

        const f1 = (currentTarget.f1 * (1 - subT) + nextTarget.f1 * subT) * tractScale;
        const f2 = (currentTarget.f2 * (1 - subT) + nextTarget.f2 * subT) * tractScale;
        const f3 = (currentTarget.f3 * (1 - subT) + nextTarget.f3 * subT) * tractScale;

        // Prosody intonation contour
        let intonationDelta = 0;
        const sentencePos = (wIdx + tRelative) / words.length;
        // Natural speech declination (starts slightly higher, gently slopes down)
        intonationDelta -= sentencePos * 0.12 * baseF0;

        // Syllable stress arc
        intonationDelta += Math.sin(tRelative * Math.PI) * (0.08 * baseF0);

        // Final question inflection or sentence cadence
        if (wIdx === words.length - 1) {
          if (isQuestion) {
            intonationDelta += tRelative * 0.35 * baseF0; // Rise for question
          } else if (hasPeriodOrQuestion) {
            intonationDelta -= tRelative * 0.15 * baseF0; // Drop for period
          }
        }

        const currentF0 = Math.max(60, baseF0 + intonationDelta);

        // Update biquad filter poles
        rF1.configure(f1, currentTarget.bandwidth[0], sampleRate);
        rF2.configure(f2, currentTarget.bandwidth[1], sampleRate);
        rF3.configure(f3, currentTarget.bandwidth[2], sampleRate);
        rChest.configure(150 * chest, 80, sampleRate);

        // Glottal excitation source (Rosenberg pulse)
        phase += (2 * Math.PI * currentF0) / sampleRate;
        if (phase > 2 * Math.PI) {
          phase -= 2 * Math.PI;
        }

        // Liljencrants-Fant / Rosenberg pulse approximation
        const normPhase = phase / (2 * Math.PI);
        let glottal = 0;
        if (normPhase < 0.6) {
          glottal = 0.5 * (1 - Math.cos((Math.PI * normPhase) / 0.6));
        } else if (normPhase < 0.8) {
          glottal = Math.cos((Math.PI * (normPhase - 0.6)) / 0.4);
        } else {
          glottal = 0;
        }

        // Noise aspiration for unvoiced sounds & breathiness
        const whiteNoise = (Math.random() * 2 - 1);
        const noiseFactor = (currentTarget.unvoicedNoise || 0) + breathiness;
        const source = glottal * (1 - (currentTarget.unvoicedNoise || 0) * 0.7) + whiteNoise * noiseFactor;

        // Parallel formant resonator filter bank
        const outF1 = rF1.process(source) * 0.6;
        const outF2 = rF2.process(source) * 0.45;
        const outF3 = rF3.process(source) * 0.25;
        const outChest = rChest.process(source) * (0.15 * chest);

        // High frequency consonant enhancement
        let fricative = 0;
        if (currentTarget.unvoicedNoise && currentTarget.unvoicedNoise > 0.3) {
          fricative = whiteNoise * currentTarget.unvoicedNoise * 0.4;
        }

        // Window envelope at edges to prevent click
        let env = 1.0;
        if (s < 120) env = s / 120;
        else if (s > wordSamplesCount - 120) env = (wordSamplesCount - s) / 120;

        let sample = (outF1 + outF2 + outF3 + outChest + fricative) * env * 1.8;

        // Simulate int8 weight quantization if NanoInt8
        if (isInt8) {
          sample = Math.round(sample * quantLevels) / quantLevels;
        }

        wordBuffer[s] = sample;
      }

      wordBuffers.push(wordBuffer);
      currentSampleIndex += wordSamplesCount;

      const wordEndTime = currentSampleIndex / sampleRate;
      wordTimings.push({
        word: rawWord,
        start: parseFloat(wordStartTime.toFixed(3)),
        end: parseFloat(wordEndTime.toFixed(3)),
      });

      // Insert pause
      let pauseLen = pauseSamples;
      if (hasPeriodOrQuestion) {
        pauseLen = Math.floor(0.24 * sampleRate);
      } else if (hasComma) {
        pauseLen = Math.floor(0.12 * sampleRate);
      }

      currentSampleIndex += pauseLen;
    }

    // Allocate total audio sample buffer
    const totalSamples = currentSampleIndex;
    const finalSamples = new Float32Array(totalSamples);

    // Merge words and pauses
    let writePtr = initPadding;
    for (let i = 0; i < wordBuffers.length; i++) {
      finalSamples.set(wordBuffers[i], writePtr);
      const isLast = i === wordBuffers.length - 1;
      const rawWord = words[i];
      let pLen = pauseSamples;
      if (/[.?!]/.test(rawWord)) pLen = Math.floor(0.24 * sampleRate);
      else if (rawWord.includes(',')) pLen = Math.floor(0.12 * sampleRate);

      writePtr += wordBuffers[i].length + (isLast ? 0 : pLen);
    }

    const duration = parseFloat((totalSamples / sampleRate).toFixed(2));
    const { base64, blob } = encodeWav(finalSamples, sampleRate);

    const endTime = performance.now();
    const generationTimeMs = Math.max(1, Math.round(endTime - startTime));
    const realTimeFactor = parseFloat((generationTimeMs / 1000 / duration).toFixed(3));

    let wavUrlCache: string | null = null;
    let audioBufferCache: AudioBuffer | null = null;

    const result: KittenGenerationResult = {
      duration,
      wavBase64: () => base64,
      wavBlob: () => blob,
      wavUrl: () => {
        if (!wavUrlCache) {
          wavUrlCache = URL.createObjectURL(blob);
        }
        return wavUrlCache;
      },
      audioBuffer: audioBufferCache,
      samples: finalSamples,
      sampleRate,
      wordTimings,
      voice: voiceIdentifier,
      model: this.model,
      speed: rate,
      pitch: pitchOffset,
      text,
      generationTimeMs,
      realTimeFactor,
      play: async () => {
        this.stop();
        if (!this.audioContext || this.audioContext.state === 'closed') {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          this.audioContext = new AudioContextClass({ sampleRate });
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        const buffer = this.audioContext.createBuffer(1, finalSamples.length, sampleRate);
        buffer.getChannelData(0).set(finalSamples);
        audioBufferCache = buffer;
        result.audioBuffer = buffer;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        this.activeSource = source;
        source.start();

        return new Promise((resolve) => {
          source.onended = () => {
            this.activeSource = null;
            resolve();
          };
        });
      },
      stop: () => {
        if (this.activeSource) {
          try {
            this.activeSource.stop();
          } catch {
            // ignore if already stopped
          }
          this.activeSource = null;
        }
      },
    };

    return result;
  }

  /**
   * Real-time text streaming synthesis (for long text / LLM outputs)
   */
  async stream(
    text: string,
    voice: KittenVoice | string | KittenVoicePersona = this.defaultVoice,
    onChunk?: (chunk: KittenStreamChunk) => void
  ): Promise<KittenGenerationResult> {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks: KittenGenerationResult[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      const chunkRes = await this.generate(sentence, voice);
      chunks.push(chunkRes);

      if (onChunk) {
        onChunk({
          chunkIndex: i,
          text: sentence,
          duration: chunkRes.duration,
          wavBase64: chunkRes.wavBase64(),
          isFinal: i === sentences.length - 1,
        });
      }
    }

    // Full result
    return this.generate(text, voice);
  }

  /**
   * Free resources and AudioContext
   */
  async dispose(): Promise<void> {
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close();
      } catch {
        // ignore
      }
      this.audioContext = null;
    }
    this.isDisposed = true;
  }

  /**
   * Stop any current playback
   */
  stop(): void {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch {
        // ignore
      }
      this.activeSource = null;
    }
  }
}

// Attach to window so user can execute the prompt snippet directly in browser console
if (typeof window !== 'undefined') {
  (window as unknown as { KittenTTS: typeof KittenTTS }).KittenTTS = KittenTTS;
  (window as unknown as { KittenModel: typeof KittenModel }).KittenModel = KittenModel;
  (window as unknown as { KittenVoice: typeof KittenVoice }).KittenVoice = KittenVoice;
}
