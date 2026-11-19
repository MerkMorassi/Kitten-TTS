/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Terminal, Shield, Zap, Sparkles, Layers, Volume2 } from 'lucide-react';
import { KITTEN_MODELS, KITTEN_VOICES, KittenModel, KittenVoice } from '../lib/kitten-tts';

export const SDKGuide: React.FC = () => {
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install @kittentts/react-native');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Hero Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🐱</span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Kitten-TTS 0.8 On-Device SDK
              </h2>
            </div>
            <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
              Kitten-TTS 0.8 is an open-weights, edge-native text-to-speech engine. The neural model weights download once, and all subsequent voice synthesis is executed entirely on the user’s local CPU/GPU/NPU.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-stone-900 text-stone-100 px-3.5 py-2 rounded-xl text-xs font-mono shadow-xs">
              <Terminal className="w-3.5 h-3.5 text-stone-400" />
              <span>npm i @kittentts/react-native</span>
              <button
                type="button"
                onClick={handleCopyInstall}
                className="ml-2 text-stone-400 hover:text-stone-100 transition-colors"
                title="Copy install command"
              >
                {copiedInstall ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[11px] text-stone-400 text-center font-mono">
              Also available for Expo, Web & Node
            </span>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              Zero Latency & 0 Cloud Costs
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              No HTTP requests to KittenML or external cloud providers. No recurring per-character or per-minute fees.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              100% Offline & Private
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              User speech text never leaves the client device. Compliant with HIPAA, GDPR, and enterprise privacy mandates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-stone-900 text-sm mb-1">
              Cross-Platform Unified API
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              First-class support for iOS, Android, Expo managed workflow, Web Audio, and edge runtime environments.
            </p>
          </div>
        </div>
      </div>

      {/* Models Comparison Table */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-semibold text-stone-900 text-base mb-1 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-600" />
          Model Architecture Spectrum (From Smallest to Best Sounding)
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Select the optimal trade-off between download size, memory footprint, and acoustic fidelity for your hardware.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-700 font-semibold">
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Parameters</th>
                <th className="py-2.5 px-3">Weight Size</th>
                <th className="py-2.5 px-3">Quantization</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">Best Suited For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {Object.values(KittenModel).map((modelKey) => {
                const m = KITTEN_MODELS[modelKey];
                return (
                  <tr key={modelKey} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-semibold text-stone-900 font-sans">
                      {m.name}
                      {modelKey === KittenModel.NanoInt8 && (
                        <span className="ml-2 text-[10px] font-mono text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-700">{m.parameters}</td>
                    <td className="py-3 px-3 text-stone-700">{m.downloadSize}</td>
                    <td className="py-3 px-3 text-stone-600">{m.quantization}</td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold">~{m.latencyMs}ms</td>
                    <td className="py-3 px-3 text-stone-500 font-sans">{m.recommendedFor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8 Built-in Voices Guide */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-semibold text-stone-900 text-base mb-1 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-orange-600" />
          The 8 Built-In Voice Profiles
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Each voice includes calibrated acoustic formants, glottal pulse shaping, and intonation dynamics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(KittenVoice).map((vKey) => {
            const v = KITTEN_VOICES[vKey];
            return (
              <div key={vKey} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-stone-900 text-sm">{v.name}</span>
                  <span className="text-[10px] text-stone-500 font-mono">{v.gender} · {v.basePitchHz}Hz</span>
                </div>
                <div className="text-[11px] font-medium text-orange-700 mb-1">
                  {v.timbre}
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Examples & API Reference */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-semibold text-stone-900 text-base">
          SDK Methods & Lifecycle Reference
        </h3>

        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-stone-900 text-stone-200 overflow-x-auto">
            <div className="text-stone-400 mb-1 text-[11px] font-sans font-semibold text-orange-400">
              1. Instantiation & Model Caching
            </div>
            <code>{`const tts = await KittenTTS.create({
  model: KittenModel.NanoInt8, // Nano, NanoInt8, Micro, Mini
  sampleRate: 24000            // default 24kHz
});`}</code>
          </div>

          <div className="p-4 rounded-xl bg-stone-900 text-stone-200 overflow-x-auto">
            <div className="text-stone-400 mb-1 text-[11px] font-sans font-semibold text-orange-400">
              2. Synchronous Speech Generation & Timings
            </div>
            <code>{`const result = await tts.generate('Generated on the device.', KittenVoice.Bella, {
  speed: 1.15,       // Speed multiplier: 0.5x to 2.0x (default 1.0)
  pitch: 10          // Pitch offset: -50% to +50% (default 0)
});

// Or set default voice customization on the instance:
tts.setVoice(KittenVoice.Bella);
tts.setSpeed(1.2);
tts.setPitch(15);

console.log(result.duration);          // 1.84 (seconds)
console.log(result.wavBase64());       // 'data:audio/wav;base64,...'
console.log(result.wordTimings);       // [{ word: 'Generated', start: 0.01, end: 0.52 }, ...]

await result.play();                   // immediate playback`}</code>
          </div>

          <div className="p-4 rounded-xl bg-stone-900 text-stone-200 overflow-x-auto">
            <div className="text-stone-400 mb-1 text-[11px] font-sans font-semibold text-orange-400">
              3. Streaming TTS for Long Text & LLM Output
            </div>
            <code>{`await tts.stream(longArticleText, KittenVoice.Hugo, (chunk) => {
  console.log(\`Received chunk #\${chunk.chunkIndex + 1}: \${chunk.duration}s\`);
  playChunkAudio(chunk.wavBase64);
});`}</code>
          </div>

          <div className="p-4 rounded-xl bg-stone-900 text-stone-200 overflow-x-auto">
            <div className="text-stone-400 mb-1 text-[11px] font-sans font-semibold text-orange-400">
              4. Cleanup & Resource Release
            </div>
            <code>{`await tts.dispose(); // Releases audio contexts and neural memory`}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
