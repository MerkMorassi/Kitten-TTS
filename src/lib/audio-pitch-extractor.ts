/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * On-Device Voice Recording Analyzer & Acoustic Pitch Extractor
 * Uses time-domain autocorrelation to detect human fundamental frequency (F0)
 * and timbre characteristics from uploaded audio recordings.
 */

export interface VoiceAnalysisResult {
  durationSec: number;
  sampleRate: number;
  basePitchHz: number;
  estimatedGender: 'Female' | 'Male' | 'Custom';
  timbre: string;
  vocalTractScale: number;
  breathiness: number;
  chestResonance: number;
  peakRms: number;
  waveformPreview: number[]; // 50 normalized amplitude points for preview
}

/**
 * Autocorrelation algorithm to extract fundamental frequency (F0) in Hz
 */
function detectPitchAutocorrelation(samples: Float32Array, sampleRate: number): number {
  const minFreq = 80;  // Lowest human voice ~80Hz
  const maxFreq = 400; // Highest typical vocal register ~400Hz
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);

  // Take a representative center segment (up to 2048 samples)
  const windowSize = Math.min(2048, samples.length);
  const startIdx = Math.max(0, Math.floor(samples.length / 2 - windowSize / 2));
  const segment = samples.subarray(startIdx, startIdx + windowSize);

  let bestPeriod = 0;
  let maxCorr = -1;

  for (let lag = minPeriod; lag <= maxPeriod; lag++) {
    let corr = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < windowSize - lag; i++) {
      corr += segment[i] * segment[i + lag];
      norm1 += segment[i] * segment[i];
      norm2 += segment[i + lag] * segment[i + lag];
    }

    const norm = Math.sqrt(norm1 * norm2);
    if (norm > 0) {
      corr /= norm;
    }

    if (corr > maxCorr) {
      maxCorr = corr;
      bestPeriod = lag;
    }
  }

  if (bestPeriod > 0 && maxCorr > 0.4) {
    const pitch = sampleRate / bestPeriod;
    return Math.round(Math.max(85, Math.min(380, pitch)));
  }

  // Default fallback if audio is unvoiced or too noisy
  return 170;
}

/**
 * Analyze decoded AudioBuffer on the device
 */
export async function analyzeAudioRecording(audioBuffer: AudioBuffer): Promise<VoiceAnalysisResult> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const durationSec = parseFloat(audioBuffer.duration.toFixed(2));

  // Compute RMS amplitude and 50-point waveform preview
  const previewPoints = 50;
  const blockSize = Math.floor(channelData.length / previewPoints);
  const waveformPreview: number[] = [];
  let totalEnergy = 0;
  let maxSample = 0;

  for (let i = 0; i < previewPoints; i++) {
    let sumSquares = 0;
    const start = i * blockSize;
    const end = Math.min(channelData.length, start + blockSize);

    for (let j = start; j < end; j++) {
      const val = channelData[j];
      const abs = Math.abs(val);
      if (abs > maxSample) maxSample = abs;
      sumSquares += val * val;
    }

    const rms = Math.sqrt(sumSquares / (end - start || 1));
    totalEnergy += rms;
    waveformPreview.push(parseFloat(Math.min(1.0, rms * 2.5).toFixed(3)));
  }

  // Detect fundamental frequency (F0)
  const detectedPitch = detectPitchAutocorrelation(channelData, sampleRate);

  // Estimate gender and vocal tract acoustics from detected pitch
  const isHigherPitch = detectedPitch > 175;
  const estimatedGender: 'Female' | 'Male' = isHigherPitch ? 'Female' : 'Male';

  let timbre = 'Warm Neutral';
  let vocalTractScale = 1.0;
  let breathiness = 0.12;
  let chestResonance = 1.0;

  if (detectedPitch < 125) {
    timbre = 'Deep Baritone / Rich Bass';
    vocalTractScale = 0.88;
    chestResonance = 1.4;
    breathiness = 0.08;
  } else if (detectedPitch < 165) {
    timbre = 'Resonant Warm Male';
    vocalTractScale = 0.94;
    chestResonance = 1.2;
    breathiness = 0.1;
  } else if (detectedPitch < 210) {
    timbre = 'Melodic Warm Female';
    vocalTractScale = 1.12;
    chestResonance = 0.85;
    breathiness = 0.14;
  } else {
    timbre = 'Bright & Crisp High Register';
    vocalTractScale = 1.22;
    chestResonance = 0.75;
    breathiness = 0.18;
  }

  return {
    durationSec,
    sampleRate,
    basePitchHz: detectedPitch,
    estimatedGender,
    timbre,
    vocalTractScale,
    breathiness,
    chestResonance,
    peakRms: parseFloat(maxSample.toFixed(2)),
    waveformPreview,
  };
}

/**
 * Decode ArrayBuffer or File to AudioBuffer using Web Audio Context
 */
export async function decodeAudioFile(file: File | Blob): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioContextClass();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  await ctx.close();
  return audioBuffer;
}
