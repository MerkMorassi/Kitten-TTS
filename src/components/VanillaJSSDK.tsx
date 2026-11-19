/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Play,
  Terminal,
  Code2,
  Sparkles,
  FileCode,
  Layers,
  Zap,
} from 'lucide-react';

export const VanillaJSSDK: React.FC = () => {
  const [activeSnippet, setActiveSnippet] = useState<'cdn' | 'custom-clone' | 'api-fetch' | 'node'>('cdn');
  const [copiedCode, setCopiedCode] = useState(false);
  const [sandboxCode, setSandboxCode] = useState(`// 1. Initialize KittenTTS in Pure Vanilla JavaScript
const tts = await KittenTTS.create({ model: KittenModel.NanoInt8 });

// 2. Synthesize speech on the device
const result = await tts.generate(
  'Pure Vanilla JavaScript on-device speech synthesis.',
  KittenVoice.Bella,
  { speed: 1.1, pitch: 5 }
);

console.log('Audio duration:', result.duration, 'seconds');
console.log('Base64 WAV string preview:', result.wavBase64().slice(0, 50) + '...');

// 3. Play immediately via Web Audio API
await result.play();

// 4. Free resources
await tts.dispose();`);

  const [sandboxLogs, setSandboxLogs] = useState<string[]>([
    '[Console Ready] Click "Execute Vanilla JS" to run directly in your browser.',
  ]);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCopyCode = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunSandbox = async () => {
    setIsExecuting(true);
    setSandboxLogs(['[Running Sandbox...]']);

    const capturedLogs: string[] = [];
    const origLog = console.log;
    console.log = (...args: unknown[]) => {
      capturedLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      origLog(...args);
    };

    try {
      const asyncFn = new Function('KittenTTS', 'KittenModel', 'KittenVoice', `
        return (async () => {
          ${sandboxCode}
        })();
      `);

      const KittenTTS = (window as unknown as { KittenTTS: unknown }).KittenTTS;
      const KittenModel = (window as unknown as { KittenModel: unknown }).KittenModel;
      const KittenVoice = (window as unknown as { KittenVoice: unknown }).KittenVoice;

      await asyncFn(KittenTTS, KittenModel, KittenVoice);
      setSandboxLogs(capturedLogs.length ? capturedLogs : ['Code executed successfully with 0 errors.']);
    } catch (err: unknown) {
      setSandboxLogs((prev) => [...prev, `Runtime Error: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      console.log = origLog;
      setIsExecuting(false);
    }
  };

  const handleDownloadSdkFile = () => {
    const a = document.createElement('a');
    a.href = '/kitten-tts.vanilla.js';
    a.download = 'kitten-tts.vanilla.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getActiveCode = () => {
    if (activeSnippet === 'cdn') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kitten-TTS Pure Vanilla JS Example</title>
  <!-- Load standalone KittenTTS library (Zero dependencies, ~15KB minified) -->
  <script src="/kitten-tts.vanilla.js"></script>
</head>
<body>
  <h1>On-Device Text to Speech</h1>
  <textarea id="text" rows="3">Generated on the device with zero cloud latency.</textarea>
  <button id="speak-btn">Speak</button>

  <script>
    document.getElementById('speak-btn').addEventListener('click', async () => {
      // 1. Create on-device synthesizer
      const tts = await KittenTTS.create({ model: KittenModel.NanoInt8 });

      // 2. Synthesize speech (returns duration, base64 WAV, word timings)
      const input = document.getElementById('text').value;
      const result = await tts.generate(input, KittenVoice.Bella, {
        speed: 1.1,  // 0.5x to 2.0x
        pitch: 0     // -50% to +50%
      });

      console.log('Duration:', result.duration);
      console.log('Base64:', result.wavBase64());

      // 3. Play directly in browser
      await result.play();

      // 4. Dispose when done
      await tts.dispose();
    });
  </script>
</body>
</html>`;
    }

    if (activeSnippet === 'custom-clone') {
      return `// Vanilla JavaScript: Synthesizing with Custom Cloned Voice Persona
import { KittenTTS, KittenModel } from './kitten-tts.vanilla.js';

const tts = await KittenTTS.create({ model: KittenModel.NanoInt8 });

// Define custom cloned voice persona properties (extracted from user recording)
const myClonedPersona = {
  id: 'my-studio-voice',
  name: 'My Custom Cloned Voice',
  basePitchHz: 195,       // Fundamental pitch in Hz
  vocalTractScale: 1.1,   // Formant frequency scale
  breathiness: 0.14,      // Vocal air ratio
  chestResonance: 1.0     // Chest resonant pole
};

// Synthesize directly using custom clone
const result = await tts.generate(
  'This speech is using my custom uploaded cloned voice persona in vanilla JavaScript.',
  myClonedPersona,
  { speed: 1.0, pitch: 0 }
);

// Get playable audio URL or download as .wav
const audioUrl = result.wavUrl();
const audio = new Audio(audioUrl);
audio.play();

await tts.dispose();`;
    }

    if (activeSnippet === 'api-fetch') {
      return `// Vanilla JavaScript: Calling Server-Side Kitten TTS Proxy with API Key
async function generateViaCloudProxy(text, cloneId) {
  // Makes a request to the server-side proxy route (/api/kitten/synthesize)
  // Server securely injects KITTEN_TTS_API_KEY without exposing it to the browser
  const response = await fetch('/api/kitten/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text,
      voice: 'Bella',
      cloneId: cloneId || 'my-custom-clone',
      speed: 1.0,
      pitch: 0
    })
  });

  const data = await response.json();
  console.log('Synthesis source:', data.source);

  // If server returned base64 WAV, play immediately
  if (data.wavBase64) {
    const audio = new Audio(data.wavBase64);
    await audio.play();
  }
}

// Example usage:
generateViaCloudProxy('Testing custom cloned voice via API key proxy.', 'my-custom-clone');`;
    }

    return `// Vanilla Node.js (ES Module / CommonJS): Save WAV to Disk
import { KittenTTS, KittenModel, KittenVoice } from './kitten-tts.vanilla.js';
import fs from 'node:fs/promises';

const tts = await KittenTTS.create({ model: KittenModel.NanoInt8 });
const result = await tts.generate('Synthesizing speech in Node.js runtime.', KittenVoice.Jasper);

// Convert base64 data to binary buffer and write to disk
const base64Data = result.wavBase64().replace(/^data:audio\\/wav;base64,/, '');
const buffer = Buffer.from(base64Data, 'base64');
await fs.writeFile('output.wav', buffer);

console.log('Saved output.wav successfully! Duration:', result.duration, 's');
await tts.dispose();`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍦</span>
            <h2 className="text-base font-semibold text-stone-900">
              Pure Vanilla JavaScript SDK & Examples
            </h2>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
              Zero Dependencies
            </span>
          </div>
          <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
            Run Kitten-TTS directly in vanilla JavaScript without React, bundling, or node_modules. Works in plain <code className="text-stone-700 font-mono">&lt;script&gt;</code> tags, Web Workers, and backend Node.js runtimes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSdkFile}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download kitten-tts.vanilla.js</span>
        </button>
      </div>

      {/* Code Snippets Browser */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-md overflow-hidden">
        {/* Tab Selector */}
        <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'cdn', label: 'HTML <script> Tag' },
              { id: 'custom-clone', label: 'Custom Cloned Voice Persona' },
              { id: 'api-fetch', label: 'API Key Server Proxy Fetch' },
              { id: 'node', label: 'Vanilla Node.js Save WAV' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSnippet(tab.id as typeof activeSnippet)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSnippet === tab.id
                    ? 'bg-stone-800 text-white font-medium shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleCopyCode(getActiveCode())}
            className="text-xs px-2.5 py-1 text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <pre className="p-5 text-xs font-mono text-stone-200 leading-relaxed overflow-x-auto select-all whitespace-pre">
          <code>{getActiveCode()}</code>
        </pre>
      </div>

      {/* Live Interactive Vanilla JS Sandbox */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-orange-600" />
              <h3 className="font-semibold text-stone-900 text-sm">
                Live In-Browser Vanilla JavaScript Sandbox
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              Edit and execute real vanilla JavaScript directly in this browser window.
            </p>
          </div>

          <button
            type="button"
            disabled={isExecuting}
            onClick={handleRunSandbox}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-60"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Execute Vanilla JS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Editor */}
          <div className="lg:col-span-7">
            <textarea
              rows={11}
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="w-full bg-stone-900 text-stone-100 font-mono text-xs p-4 rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 leading-relaxed"
            />
          </div>

          {/* Console output */}
          <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-xl p-3.5 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-stone-500 mb-2 font-sans font-semibold text-[11px] pb-1 border-b border-stone-200/60">
                <Terminal className="w-3.5 h-3.5" />
                <span>Sandbox Output Console</span>
              </div>
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto">
                {sandboxLogs.map((log, i) => (
                  <div key={i} className="text-stone-800 break-all leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/60 text-[10px] text-stone-400 font-sans">
              Runs in current page context using native Web Audio API
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
