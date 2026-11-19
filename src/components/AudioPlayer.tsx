/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Code,
  Volume2,
  Repeat,
  Sparkles,
  Layers,
  Clock,
  Zap,
} from 'lucide-react';
import { KittenGenerationResult, KITTEN_VOICES, KITTEN_MODELS, KittenVoice, KittenVoiceSpecs } from '../lib/kitten-tts';

interface AudioPlayerProps {
  result: KittenGenerationResult | null;
  onClear?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [showBase64Modal, setShowBase64Modal] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Stop previous audio when result changes
  useEffect(() => {
    stopPlayback();
    setCurrentTime(0);
    pauseOffsetRef.current = 0;
  }, [result]);

  const stopPlayback = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayPause = async () => {
    if (!result) return;

    if (isPlaying) {
      // Pause
      if (audioContextRef.current) {
        pauseOffsetRef.current = currentTime;
      }
      stopPlayback();
    } else {
      // Play
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContextClass({ sampleRate: result.sampleRate });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const buffer = audioContextRef.current.createBuffer(
        1,
        result.samples.length,
        result.sampleRate
      );
      buffer.getChannelData(0).set(result.samples);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;
      source.connect(audioContextRef.current.destination);

      let offset = pauseOffsetRef.current;
      if (offset >= result.duration) {
        offset = 0;
      }

      startTimeRef.current = audioContextRef.current.currentTime - offset / playbackRate;
      source.start(0, offset);
      sourceRef.current = source;
      setIsPlaying(true);

      const updateProgress = () => {
        if (!audioContextRef.current || !sourceRef.current) return;
        const elapsed = (audioContextRef.current.currentTime - startTimeRef.current) * playbackRate;

        if (elapsed >= result.duration) {
          if (isLooping) {
            handlePlayPause(); // replay
          } else {
            setCurrentTime(result.duration);
            pauseOffsetRef.current = 0;
            setIsPlaying(false);
          }
        } else {
          setCurrentTime(elapsed);
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateProgress);

      source.onended = () => {
        if (!isLooping) {
          setIsPlaying(false);
          pauseOffsetRef.current = 0;
        }
      };
    }
  };

  const handleRestart = () => {
    stopPlayback();
    setCurrentTime(0);
    pauseOffsetRef.current = 0;
    setTimeout(() => {
      handlePlayPause();
    }, 50);
  };

  const handleScrub = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!result || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = progress * result.duration;

    const wasPlaying = isPlaying;
    stopPlayback();
    pauseOffsetRef.current = newTime;
    setCurrentTime(newTime);

    if (wasPlaying) {
      setTimeout(() => {
        handlePlayPause();
      }, 50);
    }
  };

  // Render Waveform on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1c1917');
    bgGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Center baseline
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const samples = result.samples;
    const step = Math.ceil(samples.length / width);
    const amp = height * 0.42;

    const playRatio = result.duration > 0 ? currentTime / result.duration : 0;
    const playX = playRatio * width;

    // Draw audio waveform bars
    for (let i = 0; i < width; i += 2) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = samples[i * step + j] || 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const barHeight = Math.max(2, (max - min) * amp);
      const y = (height - barHeight) / 2;

      // Color based on whether played or unplayed
      if (i <= playX) {
        ctx.fillStyle = '#f97316'; // orange-500
      } else {
        ctx.fillStyle = '#78716c'; // stone-500
      }

      ctx.fillRect(i, y, 1.5, barHeight);
    }

    // Draw playhead cursor
    if (result.duration > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(playX - 1, 0, 2, height);

      ctx.beginPath();
      ctx.arc(playX, 8, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [result, currentTime]);

  const handleDownloadWav = () => {
    if (!result) return;
    const blob = result.wavBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitten-tts-${result.voice.toLowerCase()}-${result.model.toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyBase64 = async () => {
    if (!result) return;
    try {
      const b64 = result.wavBase64();
      await navigator.clipboard.writeText(b64);
      setCopiedBase64(true);
      setTimeout(() => setCopiedBase64(false), 2000);
    } catch (err) {
      console.error('Failed to copy Base64:', err);
    }
  };

  if (!result) {
    return (
      <div className="border border-stone-200 border-dashed rounded-2xl p-8 text-center bg-stone-50/50">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <Volume2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-stone-800 mb-1">
          No Audio Generated Yet
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Type or select a sample text above and click <strong className="text-stone-700">Synthesize Speech</strong> to run the Kitten-TTS model on your device.
        </p>
      </div>
    );
  }

  const voiceSpec = (KITTEN_VOICES as Record<string, (typeof KITTEN_VOICES)[KittenVoice]>)[result.voice] || {
    name: result.voice,
    gender: 'Custom' as const,
    timbre: 'Cloned Voice Persona',
    accent: 'Local / Cloned Voice',
  };
  const modelSpec = KITTEN_MODELS[result.model];
  const wavSizeBytes = result.samples.length * 2 + 44;
  const wavSizeKb = (wavSizeBytes / 1024).toFixed(1);

  return (
    <div className="border border-stone-200 rounded-2xl bg-white shadow-xs overflow-hidden">
      {/* Top Bar info */}
      <div className="p-4 border-b border-stone-100 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 text-sm">
                Voice: {voiceSpec.name} ({voiceSpec.gender})
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-600 font-mono">
                {modelSpec.name}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              {voiceSpec.timbre} · {voiceSpec.accent}
            </p>
          </div>
        </div>

        {/* Synthesis Metrics */}
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-stone-200/60 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Duration: <strong className="text-stone-900 font-mono">{result.duration}s</strong></span>
          </div>

          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-stone-200/60 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Inference: <strong className="text-stone-900 font-mono">{result.generationTimeMs}ms</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-stone-200/60 shadow-xs font-mono">
            <span>Speed: <strong className="text-stone-900">{result.speed?.toFixed(2) || '1.00'}x</strong></span>
            <span className="text-stone-300">·</span>
            <span>Pitch: <strong className="text-stone-900">{(result.pitch ?? 0) > 0 ? `+${result.pitch}%` : `${result.pitch ?? 0}%`}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-stone-200/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>RTF: <strong className="text-emerald-700 font-mono">{result.realTimeFactor}x</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-stone-200/60 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            <span>WAV: <strong className="text-stone-900 font-mono">{wavSizeKb} KB</strong></span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Interactive Waveform Canvas */}
        <div className="relative rounded-xl overflow-hidden shadow-inner group">
          <canvas
            ref={canvasRef}
            width={800}
            height={90}
            onClick={handleScrub}
            className="w-full h-24 sm:h-28 block cursor-pointer"
          />
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-stone-400 bg-stone-900/60 backdrop-blur-xs px-2 py-0.5 rounded">
            Click anywhere on waveform to seek
          </div>
        </div>

        {/* Word-by-Word Synchronized Transcript (Karaoke) */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
          <div className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mb-1.5 flex items-center justify-between">
            <span>Synchronized Word Timings</span>
            <span className="font-mono text-stone-500 lowercase">{result.wordTimings.length} tokens</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-sm sm:text-base leading-relaxed">
            {result.wordTimings.map((wt, idx) => {
              const isWordActive = currentTime >= wt.start && currentTime <= wt.end;
              const isPast = currentTime > wt.end;

              return (
                <span
                  key={idx}
                  title={`${wt.word} [${wt.start.toFixed(2)}s - ${wt.end.toFixed(2)}s]`}
                  className={`px-1.5 py-0.5 rounded transition-colors duration-100 ${
                    isWordActive
                      ? 'bg-orange-500 text-white font-semibold shadow-xs scale-105'
                      : isPast
                      ? 'text-stone-800'
                      : 'text-stone-400'
                  }`}
                >
                  {wt.word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Main Play / Seek buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayPause}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Speech</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              title="Restart from beginning"
              className="p-2 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              title={isLooping ? 'Looping enabled' : 'Loop disabled'}
              className={`p-2 border rounded-xl transition-colors cursor-pointer ${
                isLooping
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 border border-stone-200 rounded-xl p-1 bg-stone-50 text-xs">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    playbackRate === rate
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-stone-500 ml-1">
              {currentTime.toFixed(2)}s / {result.duration}s
            </span>
          </div>

          {/* Export & Developer Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadWav}
              className="px-3 py-1.5 border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Download .WAV</span>
            </button>

            <button
              type="button"
              onClick={handleCopyBase64}
              className="px-3 py-1.5 border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedBase64 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied Base64</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Base64</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowBase64Modal(true)}
              className="p-2 border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-xl transition-colors cursor-pointer"
              title="Inspect Raw Base64 string & WAV headers"
            >
              <Code className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Raw Base64 Inspection Modal */}
      {showBase64Modal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-stone-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">
                  KittenTTS Result Output: <code className="text-orange-600 font-mono text-xs">result.wavBase64()</code>
                </h3>
                <p className="text-xs text-stone-500">
                  Exact RIFF WAVE 16-bit PCM header & encoded audio samples.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBase64Modal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="bg-stone-900 text-stone-100 p-3 rounded-xl overflow-x-auto select-all max-h-60 break-all">
                {result.wavBase64()}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-2 border-t border-stone-100">
                <div>Sample Rate: <strong>{result.sampleRate} Hz</strong></div>
                <div>Channels: <strong>1 (Mono)</strong></div>
                <div>Bits Per Sample: <strong>16-bit PCM</strong></div>
                <div>Total Samples: <strong>{result.samples.length.toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCopyBase64}
                className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
              >
                {copiedBase64 ? 'Copied to Clipboard!' : 'Copy String'}
              </button>
              <button
                type="button"
                onClick={() => setShowBase64Modal(false)}
                className="px-3 py-1.5 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
