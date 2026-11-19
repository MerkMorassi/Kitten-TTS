/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  KittenModel,
  KittenVoice,
  KittenTTS,
  KittenGenerationResult,
  KittenVoicePersona,
  KITTEN_VOICES,
  KITTEN_MODELS,
} from './lib/kitten-tts';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { VoiceCustomizer } from './components/VoiceCustomizer';
import { VoiceCloningStudio } from './components/VoiceCloningStudio';
import { VanillaJSSDK } from './components/VanillaJSSDK';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceMatrix } from './components/VoiceMatrix';
import { StreamingTTS } from './components/StreamingTTS';
import { CodePlayground } from './components/CodePlayground';
import { SDKGuide } from './components/SDKGuide';
import {
  Sparkles,
  Volume2,
  Cpu,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const PRESETS = [
  { label: 'Default Prompt', text: 'Generated on the device.' },
  { label: 'Offline Assistant', text: 'Welcome to Kitty TTS. All neural synthesis is performed locally on your device with zero cloud latency.' },
  { label: 'Turn-by-Turn GPS', text: 'In three hundred meters, turn right on Grand Avenue, then continue straight for two miles.' },
  { label: 'Smart Home Event', text: 'All doors locked and security systems armed. Temperature set to seventy degrees.' },
  { label: 'Book Excerpt', text: 'The ancient valley was bathed in dawn light, mist rising slowly above the silent pine forest.' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'cloning' | 'vanillajs' | 'matrix' | 'streaming' | 'playground' | 'docs'>('studio');
  const [model, setModel] = useState<KittenModel>(KittenModel.NanoInt8);
  const [voice, setVoice] = useState<KittenVoice | string>(KittenVoice.Bella);
  const [text, setText] = useState<string>('Generated on the device.');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<KittenGenerationResult | null>(null);
  const [firstLoadDone, setFirstLoadDone] = useState<boolean>(false);

  const [customPersonas, setCustomPersonas] = useState<KittenVoicePersona[]>(() => {
    try {
      const saved = localStorage.getItem('kitten_custom_personas');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'account_clone_1',
        name: 'Account Cloned Voice',
        isCloned: true,
        cloneId: 'my-custom-clone',
        gender: 'Custom',
        basePitchHz: 185,
        vocalTractScale: 1.05,
        breathiness: 0.12,
        chestResonance: 1.1,
        timbre: 'Studio Broadcast Resonant',
        description: 'Account clone created on Kitten TTS Website portal.',
        createdAt: 'Saved',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kitten_custom_personas', JSON.stringify(customPersonas));
    } catch {
      // ignore
    }
  }, [customPersonas]);

  // Auto-synthesize initial prompt on mount
  useEffect(() => {
    let isCancelled = false;

    const runInitialSynthesis = async () => {
      try {
        setIsGenerating(true);
        const tts = await KittenTTS.create({ model: KittenModel.NanoInt8 });
        const res = await tts.generate('Generated on the device.', KittenVoice.Bella);
        if (!isCancelled) {
          setResult(res);
          setFirstLoadDone(true);
          console.log('[KittenTTS Initialized]');
          console.log('Duration:', res.duration);
          console.log('Base64 WAV:', res.wavBase64());
        }
        await tts.dispose();
      } catch (err) {
        console.error('Initial synthesis failed:', err);
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    runInitialSynthesis();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSynthesize = async () => {
    if (!text.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const tts = await KittenTTS.create({ model });
      const personaMatch = customPersonas.find((p) => p.name === voice || p.id === voice);
      const res = await tts.generate(text, personaMatch || voice, {
        speed,
        pitch,
      });

      setResult(res);
      console.log(`[KittenTTS] Generated with voice ${voice} (${model}) at ${speed.toFixed(2)}x speed, ${pitch}% pitch`);
      console.log('Duration:', res.duration);
      console.log('Base64 WAV length:', res.wavBase64().length);

      // Free instance
      await tts.dispose();
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      <Header
        currentModel={model}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        customPersonasCount={customPersonas.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Top Prompt & Status Notice */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <label htmlFor="tts-text-input" className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Input Text to Synthesize
                  </label>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span>{text.length} characters</span>
                  <span>·</span>
                  <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="tts-text-input"
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type anything here to generate speech completely on your device..."
                  className="w-full text-sm sm:text-base border border-stone-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 leading-relaxed resize-y min-h-[90px]"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-stone-100 overflow-x-auto no-scrollbar text-xs">
                <span className="text-[11px] text-stone-400 font-medium shrink-0">Sample prompts:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setText(p.text)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      text === p.text
                        ? 'bg-orange-100 text-orange-800 font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Architecture Selector */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <ModelSelector
                selectedModel={model}
                onSelectModel={(m) => setModel(m)}
                disabled={isGenerating}
              />
            </div>

            {/* Voice Profile & Customization Controls (Speed & Pitch) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <VoiceCustomizer
                selectedVoice={voice}
                onSelectVoice={(v) => setVoice(v)}
                speed={speed}
                onChangeSpeed={(s) => setSpeed(s)}
                pitch={pitch}
                onChangePitch={(p) => setPitch(p)}
                currentModel={model}
                customPersonas={customPersonas}
                onNavigateToCloning={() => setActiveTab('cloning')}
                disabled={isGenerating}
              />
            </div>

            {/* Synthesize Action Bar */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Target Config:</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded-lg text-stone-800 font-medium">{voice}</span>
                <span className="text-stone-300">·</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded-lg text-stone-700 font-mono">{KITTEN_MODELS[model].name}</span>
                <span className="text-stone-300">·</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded-lg text-stone-700 font-mono">Speed: {speed.toFixed(2)}x</span>
                <span className="text-stone-300">·</span>
                <span className="bg-stone-100 px-2.5 py-1 rounded-lg text-stone-700 font-mono">Pitch: {pitch > 0 ? `+${pitch}%` : `${pitch}%`}</span>
              </div>

              <button
                type="button"
                disabled={isGenerating || !text.trim()}
                onClick={handleSynthesize}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing On Device...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Synthesize Speech</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Audio Player & Waveform Visualizer */}
            <AudioPlayer result={result} />
          </div>
        )}

        {/* Voice Cloning & Personas Studio */}
        {activeTab === 'cloning' && (
          <VoiceCloningStudio
            currentModel={model}
            activePersonaId={typeof voice === 'string' ? voice : undefined}
            customPersonas={customPersonas}
            setCustomPersonas={setCustomPersonas}
            onSelectPersonaAsActive={(persona) => {
              setVoice(persona.name);
              setActiveTab('studio');
            }}
          />
        )}

        {/* Vanilla JS SDK & Code Examples */}
        {activeTab === 'vanillajs' && (
          <VanillaJSSDK />
        )}

        {/* 8-Voice Matrix View */}
        {activeTab === 'matrix' && (
          <VoiceMatrix currentModel={model} />
        )}

        {/* Streaming TTS View */}
        {activeTab === 'streaming' && (
          <StreamingTTS
            currentModel={model}
            currentVoice={typeof voice === 'string' && Object.values(KittenVoice).includes(voice as KittenVoice) ? (voice as KittenVoice) : KittenVoice.Bella}
          />
        )}

        {/* Live Code Console / Playground */}
        {activeTab === 'playground' && (
          <CodePlayground />
        )}

        {/* SDK & Documentation View */}
        {activeTab === 'docs' && (
          <SDKGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>Kitten-TTS 0.8 Architecture</span>
            <span>·</span>
            <span>Local Neural Formant Synthesis</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              100% Offline
            </span>
          </div>

          <div className="text-[11px] text-stone-400">
            Export format: 16-bit PCM RIFF WAVE · 24,000 Hz Mono · Base64
          </div>
        </div>
      </footer>
    </div>
  );
}
