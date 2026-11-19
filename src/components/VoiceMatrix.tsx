/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KittenModel, KittenVoice, KITTEN_VOICES, KittenTTS, KittenGenerationResult } from '../lib/kitten-tts';
import { Play, Pause, Loader2, Sparkles, Download, Volume2 } from 'lucide-react';

interface VoiceMatrixProps {
  currentModel: KittenModel;
}

export const VoiceMatrix: React.FC<VoiceMatrixProps> = ({ currentModel }) => {
  const [testText, setTestText] = useState('Generated on the device with Kitten-TTS 0.8.');
  const [matrixSpeed, setMatrixSpeed] = useState<number>(1.0);
  const [matrixPitch, setMatrixPitch] = useState<number>(0);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [results, setResults] = useState<Record<KittenVoice, KittenGenerationResult | null>>({
    [KittenVoice.Bella]: null,
    [KittenVoice.Jasper]: null,
    [KittenVoice.Luna]: null,
    [KittenVoice.Bruno]: null,
    [KittenVoice.Rosie]: null,
    [KittenVoice.Hugo]: null,
    [KittenVoice.Kiki]: null,
    [KittenVoice.Leo]: null,
  });
  const [activePlayingVoice, setActivePlayingVoice] = useState<KittenVoice | null>(null);

  const voiceKeys = [
    KittenVoice.Bella,
    KittenVoice.Jasper,
    KittenVoice.Luna,
    KittenVoice.Bruno,
    KittenVoice.Rosie,
    KittenVoice.Hugo,
    KittenVoice.Kiki,
    KittenVoice.Leo,
  ];

  const handleGenerateAll = async () => {
    if (!testText.trim()) return;
    setIsGeneratingAll(true);

    try {
      const tts = await KittenTTS.create({ model: currentModel });
      const newResults: Record<KittenVoice, KittenGenerationResult | null> = { ...results };

      for (const vKey of voiceKeys) {
        const res = await tts.generate(testText, vKey, {
          speed: matrixSpeed,
          pitch: matrixPitch,
        });
        newResults[vKey] = res;
      }

      setResults(newResults);
      await tts.dispose();
    } catch (err) {
      console.error('Matrix generation error:', err);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleTogglePlay = async (voice: KittenVoice) => {
    const res = results[voice];
    if (!res) return;

    if (activePlayingVoice === voice) {
      res.stop();
      setActivePlayingVoice(null);
    } else {
      // stop other playing voices
      if (activePlayingVoice && results[activePlayingVoice]) {
        results[activePlayingVoice]?.stop();
      }

      setActivePlayingVoice(voice);
      await res.play();
      setActivePlayingVoice(null);
    }
  };

  const handleDownload = (voice: KittenVoice) => {
    const res = results[voice];
    if (!res) return;
    const blob = res.wavBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kitten-tts-${voice.toLowerCase()}-${currentModel.toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-stone-900 text-base">
              8-Voice Comparison Matrix
            </h2>
            <p className="text-xs text-stone-500">
              Synthesize the exact same sentence across all 8 KittenTTS speaker profiles simultaneously to compare timbre, pitch, and prosody.
            </p>
          </div>

          <button
            type="button"
            disabled={isGeneratingAll}
            onClick={handleGenerateAll}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating 8 Voices...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate All 8 Voices</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type sample phrase for comparison..."
            className="w-full text-sm border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        {/* Global Pitch & Speed for Matrix */}
        <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-3 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200/60">
            <span className="text-stone-500 font-medium shrink-0">Speed:</span>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={matrixSpeed}
              onChange={(e) => setMatrixSpeed(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <span className="font-mono text-stone-800 font-semibold w-10 text-right">{matrixSpeed.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200/60">
            <span className="text-stone-500 font-medium shrink-0">Pitch:</span>
            <input
              type="range"
              min={-50}
              max={50}
              step={1}
              value={matrixPitch}
              onChange={(e) => setMatrixPitch(parseInt(e.target.value, 10))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <span className="font-mono text-stone-800 font-semibold w-10 text-right">{matrixPitch > 0 ? `+${matrixPitch}%` : `${matrixPitch}%`}</span>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 mt-2.5 text-xs overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-stone-400 font-medium shrink-0">Try preset:</span>
          {[
            'Generated on the device.',
            'The weather in San Francisco is clear and 68 degrees.',
            'Flight 402 is now boarding at Gate B12.',
            'In three hundred meters, turn right onto Sunset Boulevard.',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTestText(preset)}
              className="text-[11px] px-2 py-1 bg-stone-100 hover:bg-stone-200/70 text-stone-700 rounded-md whitespace-nowrap transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Voice Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {voiceKeys.map((vKey) => {
          const spec = KITTEN_VOICES[vKey];
          const res = results[vKey];
          const isPlaying = activePlayingVoice === vKey;

          return (
            <div
              key={vKey}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                res
                  ? 'bg-white border-stone-200 shadow-xs'
                  : 'bg-stone-50/50 border-stone-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">
                      {spec.name}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {spec.gender} · {spec.basePitchHz}Hz
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    {spec.timbre}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 line-clamp-2 mb-3">
                  {spec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                {res ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(vKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-orange-600 text-white'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-white" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Listen ({res.duration}s)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(vKey)}
                      title="Download WAV"
                      className="p-1.5 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-stone-400 italic flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Awaiting generation...</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
