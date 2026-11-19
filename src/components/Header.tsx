/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import { KittenModel, KITTEN_MODELS } from '../lib/kitten-tts';

interface HeaderProps {
  currentModel: KittenModel;
  activeTab: 'studio' | 'cloning' | 'vanillajs' | 'matrix' | 'streaming' | 'playground' | 'docs';
  setActiveTab: (tab: 'studio' | 'cloning' | 'vanillajs' | 'matrix' | 'streaming' | 'playground' | 'docs') => void;
  customPersonasCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentModel, activeTab, setActiveTab, customPersonasCount = 0 }) => {
  const modelSpec = KITTEN_MODELS[currentModel];

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-sm shadow-orange-500/20 text-lg">
              🐱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-stone-900 tracking-tight text-base sm:text-lg">
                  Kitten-TTS <span className="text-orange-600 font-mono text-sm font-medium">v0.8</span>
                </h1>
                <span className="text-stone-300">|</span>
                <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  On-Device Local DSP
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Zero API keys required · 100% private offline synthesis · Custom Voice Cloning
              </p>
            </div>
          </div>

          {/* Model info banner */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-stone-600 bg-stone-50 px-3.5 py-1.5 rounded-lg border border-stone-200/80">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-stone-400" />
              <span>Model: <strong className="text-stone-800">{modelSpec.name}</strong></span>
            </div>
            <span className="text-stone-300">·</span>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-stone-400" />
              <span>Footprint: <strong className="text-stone-800">{modelSpec.downloadSize}</strong> ({modelSpec.parameters})</span>
            </div>
            <span className="text-stone-300">·</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Edge Latency: <strong className="text-stone-800">~{modelSpec.latencyMs}ms</strong></span>
            </div>
            <span className="text-stone-300">·</span>
            <div className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>0 Cloud Fees</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mt-3 pt-2 border-t border-stone-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Studio & Synthesizer
          </button>

          <button
            onClick={() => setActiveTab('cloning')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cloning'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>Voice Cloning & Personas</span>
            {customPersonasCount > 0 ? (
              <span className="text-[10px] px-1.5 py-0.2 bg-orange-100 text-orange-800 rounded font-semibold">
                {customPersonasCount}
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded">
                Upload
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vanillajs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vanillajs'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>Vanilla JS SDK</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-mono font-medium">
              HTML/JS
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            8-Voice Matrix
          </button>
          <button
            onClick={() => setActiveTab('streaming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'streaming'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Streaming Audio
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'playground'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span>Live SDK Console</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded font-mono">React Native</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            SDK Guide & Specs
          </button>
        </nav>
      </div>
    </header>
  );
};
