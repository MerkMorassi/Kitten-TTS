/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KittenTTS, KittenModel, KittenVoice, KittenGenerationResult } from '../lib/kitten-tts';
import { Play, Copy, Check, Terminal, Loader2, Sparkles, Volume2, Trash2 } from 'lucide-react';

interface ConsoleLog {
  id: string;
  timestamp: string;
  type: 'log' | 'info' | 'success' | 'warn';
  message: string;
  result?: KittenGenerationResult;
}

export const CodePlayground: React.FC = () => {
  const [selectedSnippetTab, setSelectedSnippetTab] = useState<'react-native' | 'expo' | 'web' | 'node'>('react-native');
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      id: 'init',
      timestamp: '00:00:00',
      type: 'info',
      message: 'KittenTTS on-device runtime initialized. Ready to execute.',
    },
  ]);
  const [activeAudioResult, setActiveAudioResult] = useState<KittenGenerationResult | null>(null);

  // Editable parameters for execution
  const [codeModel, setCodeModel] = useState<KittenModel>(KittenModel.NanoInt8);
  const [codeVoice, setCodeVoice] = useState<KittenVoice>(KittenVoice.Bella);
  const [codeText, setCodeText] = useState('Generated on the device.');
  const [codeSpeed, setCodeSpeed] = useState<number>(1.0);
  const [codePitch, setCodePitch] = useState<number>(0);

  const runCode = async () => {
    setIsRunning(true);
    const now = new Date().toTimeString().split(' ')[0];

    try {
      addLog({
        id: String(Date.now()),
        timestamp: now,
        type: 'info',
        message: `> KittenTTS.create({ model: KittenModel.${codeModel} })`,
      });

      const tts = await KittenTTS.create({ model: codeModel });

      addLog({
        id: String(Date.now() + 1),
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'info',
        message: `> tts.generate('${codeText}', KittenVoice.${codeVoice}, { speed: ${codeSpeed}, pitch: ${codePitch} })`,
      });

      const result = await tts.generate(codeText, codeVoice, {
        speed: codeSpeed,
        pitch: codePitch,
      });

      const b64 = result.wavBase64();
      const b64Preview = b64.length > 50 ? `${b64.slice(0, 42)}...[${b64.length} chars]` : b64;

      addLog({
        id: String(Date.now() + 2),
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'log',
        message: `duration: ${result.duration}s  wavBase64: "${b64Preview}"`,
        result,
      });

      addLog({
        id: String(Date.now() + 3),
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'success',
        message: `await tts.dispose() -> Memory cleared. Speed: ${codeSpeed}x, Pitch: ${codePitch}%, Inference: ${result.generationTimeMs}ms`,
      });

      setActiveAudioResult(result);
      await tts.dispose();
    } catch (err: unknown) {
      addLog({
        id: String(Date.now() + 4),
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'warn',
        message: `Error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const addLog = (log: ConsoleLog) => {
    setLogs((prev) => [...prev, log]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getCodeSnippet = () => {
    const customOpts = (codeSpeed !== 1.0 || codePitch !== 0)
      ? `, {\n  speed: ${codeSpeed.toFixed(2)},\n  pitch: ${codePitch},\n}`
      : '';

    if (selectedSnippetTab === 'react-native') {
      return `import { KittenTTS, KittenModel, KittenVoice } from '@kittentts/react-native';

// Initialize the ultra-fast INT8 quantized nano model
const tts = await KittenTTS.create({ model: KittenModel.${codeModel} });

// Synthesize on the device with custom voice parameters
const result = await tts.generate('${codeText}', KittenVoice.${codeVoice}${customOpts});

console.log(result.duration, result.wavBase64());

// Play speech immediately
await result.play();

// Free model memory when finished
await tts.dispose();`;
    }

    if (selectedSnippetTab === 'expo') {
      return `import { Audio } from 'expo-av';
import { KittenTTS, KittenModel, KittenVoice } from '@kittentts/react-native';

export default function AudioScreen() {
  const speak = async () => {
    const tts = await KittenTTS.create({ model: KittenModel.${codeModel} });
    const result = await tts.generate('${codeText}', KittenVoice.${codeVoice}${customOpts});

    // Play using expo-av or built-in result.play()
    const { sound } = await Audio.Sound.createAsync({ uri: result.wavUrl() });
    await sound.playAsync();

    await tts.dispose();
  };
  return <Button title="Speak on Device" onPress={speak} />;
}`;
    }

    if (selectedSnippetTab === 'web') {
      return `import { KittenTTS, KittenModel, KittenVoice } from '@kittentts/web';

const tts = await KittenTTS.create({ model: KittenModel.${codeModel} });
const result = await tts.generate('${codeText}', KittenVoice.${codeVoice}${customOpts});

// Web Audio API playback & Base64 access
console.log('Duration:', result.duration, 'WAV Base64:', result.wavBase64());
await result.play();
await tts.dispose();`;
    }

    return `import { KittenTTS, KittenModel, KittenVoice } from '@kittentts/node';
import fs from 'node:fs/promises';

const tts = await KittenTTS.create({ model: KittenModel.${codeModel} });
const result = await tts.generate('${codeText}', KittenVoice.${codeVoice}${customOpts});

// Save directly to disk without cloud costs
const buffer = Buffer.from(result.wavBase64().split(',')[1], 'base64');
await fs.writeFile('output.wav', buffer);
await tts.dispose();`;
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Code Editor & Runner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Code Editor & Controls */}
        <div className="lg:col-span-7 bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header / Tabs */}
            <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs font-mono text-stone-400 ml-2">
                  kittentts-demo.ts
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(['react-native', 'expo', 'web', 'node'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedSnippetTab(tab)}
                    className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                      selectedSnippetTab === tab
                        ? 'bg-stone-800 text-stone-100 font-medium'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {tab === 'react-native' ? 'React Native' : tab.toUpperCase()}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy Code"
                  className="p-1 text-stone-400 hover:text-stone-200 transition-colors ml-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick config parameters inside the code */}
            <div className="px-4 py-2.5 bg-stone-950/40 border-b border-stone-800 flex flex-wrap items-center gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">model:</span>
                <select
                  value={codeModel}
                  onChange={(e) => setCodeModel(e.target.value as KittenModel)}
                  className="bg-stone-800 text-orange-400 border border-stone-700 rounded px-2 py-0.5 text-xs font-mono focus:outline-none"
                >
                  {Object.values(KittenModel).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">voice:</span>
                <select
                  value={codeVoice}
                  onChange={(e) => setCodeVoice(e.target.value as KittenVoice)}
                  className="bg-stone-800 text-cyan-400 border border-stone-700 rounded px-2 py-0.5 text-xs font-mono focus:outline-none"
                >
                  {Object.values(KittenVoice).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">speed:</span>
                <input
                  type="number"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={codeSpeed}
                  onChange={(e) => setCodeSpeed(parseFloat(e.target.value) || 1.0)}
                  className="bg-stone-800 text-emerald-400 border border-stone-700 rounded px-1.5 py-0.5 text-xs font-mono w-14 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-stone-500">pitch:</span>
                <input
                  type="number"
                  min={-50}
                  max={50}
                  step={1}
                  value={codePitch}
                  onChange={(e) => setCodePitch(parseInt(e.target.value, 10) || 0)}
                  className="bg-stone-800 text-amber-400 border border-stone-700 rounded px-1.5 py-0.5 text-xs font-mono w-14 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                <span className="text-stone-500">text:</span>
                <input
                  type="text"
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  className="bg-stone-800 text-stone-200 border border-stone-700 rounded px-2 py-0.5 text-xs font-mono w-full focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>

            {/* Code Body */}
            <pre className="p-4 text-xs font-mono text-stone-300 leading-relaxed overflow-x-auto select-all whitespace-pre">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>

          {/* Action Bar */}
          <div className="p-3 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Executes in local in-memory Web Audio DSP runtime
            </span>

            <button
              type="button"
              disabled={isRunning}
              onClick={runCode}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Code Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Console Output */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-stone-500" />
                <span className="font-semibold text-stone-800 text-xs">
                  Runtime Terminal Output
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearLogs}
                  title="Clear Console"
                  className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3.5 font-mono text-xs space-y-2 max-h-[360px] overflow-y-auto">
              {logs.map((item) => (
                <div key={item.id} className="leading-relaxed flex items-start gap-2">
                  <span className="text-stone-400 text-[10px] shrink-0 pt-0.5">
                    [{item.timestamp}]
                  </span>
                  <div className="flex-1 break-all">
                    {item.type === 'log' && (
                      <span className="text-stone-900 font-semibold">{item.message}</span>
                    )}
                    {item.type === 'info' && (
                      <span className="text-stone-500">{item.message}</span>
                    )}
                    {item.type === 'success' && (
                      <span className="text-emerald-700 font-medium">{item.message}</span>
                    )}
                    {item.type === 'warn' && (
                      <span className="text-rose-600">{item.message}</span>
                    )}

                    {item.result && (
                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => item.result?.play()}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-sans font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Play Output ({item.result.duration}s)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom active audio player quick preview if generated */}
          {activeAudioResult && (
            <div className="p-3 bg-orange-50/80 border-t border-orange-100 flex items-center justify-between text-xs">
              <span className="text-orange-900 font-medium truncate max-w-[200px]">
                Last output: {activeAudioResult.duration}s ({activeAudioResult.voice})
              </span>
              <button
                type="button"
                onClick={() => activeAudioResult.play()}
                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Replay</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
