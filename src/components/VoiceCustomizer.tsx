/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  KittenVoice,
  KITTEN_VOICES,
  KittenTTS,
  KittenModel,
  KittenVoicePersona,
} from '../lib/kitten-tts';
import {
  Volume2,
  Gauge,
  Sliders,
  RotateCcw,
  Sparkles,
  Loader2,
  Music,
  Check,
  Plus,
} from 'lucide-react';

interface VoiceCustomizerProps {
  selectedVoice: KittenVoice | string;
  onSelectVoice: (voice: KittenVoice | string) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  pitch: number;
  onChangePitch: (pitch: number) => void;
  currentModel: KittenModel;
  customPersonas?: KittenVoicePersona[];
  onNavigateToCloning?: () => void;
  disabled?: boolean;
}

const STYLE_PRESETS = [
  { label: 'Natural Voice', speed: 1.0, pitch: 0, desc: 'Original voice timbre' },
  { label: 'Fast Narration', speed: 1.25, pitch: 5, desc: 'Upbeat informational' },
  { label: 'Deep Broadcast', speed: 0.95, pitch: -20, desc: 'Authoritative & resonant' },
  { label: 'Lively Assistant', speed: 1.15, pitch: 18, desc: 'Crisp & friendly' },
  { label: 'Calm Meditation', speed: 0.8, pitch: -12, desc: 'Slow, soothing pace' },
];

export const VoiceCustomizer: React.FC<VoiceCustomizerProps> = ({
  selectedVoice,
  onSelectVoice,
  speed,
  onChangeSpeed,
  pitch,
  onChangePitch,
  currentModel,
  customPersonas = [],
  onNavigateToCloning,
  disabled = false,
}) => {
  const [isAuditioning, setIsAuditioning] = useState(false);

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

  const customMatch = customPersonas.find((p) => p.name === selectedVoice || p.id === selectedVoice);
  const currentSpec = customMatch
    ? {
        name: customMatch.name,
        gender: customMatch.gender,
        timbre: customMatch.timbre,
        basePitchHz: customMatch.basePitchHz,
        accent: 'Custom Cloned Persona',
        description: customMatch.description,
      }
    : (KITTEN_VOICES[selectedVoice as KittenVoice] || KITTEN_VOICES[KittenVoice.Bella]);

  const effectivePitchHz = Math.round(currentSpec.basePitchHz * (1 + pitch / 100));
  // Calculate approximate semitone shift: 12 * log2(1 + pitch/100)
  const semitones = (12 * Math.log2(1 + pitch / 100)).toFixed(1);

  const handleAudition = async () => {
    if (isAuditioning) return;
    setIsAuditioning(true);

    try {
      const tts = await KittenTTS.create({ model: currentModel });
      const testText = `Hello! I am ${currentSpec.name}. Testing speech at ${speed.toFixed(2)} speed.`;
      const res = await tts.generate(testText, customMatch || selectedVoice, {
        speed,
        pitch,
      });
      await res.play();
      await tts.dispose();
    } catch (err) {
      console.error('Audition error:', err);
    } finally {
      setIsAuditioning(false);
    }
  };

  const handleReset = () => {
    onChangeSpeed(1.0);
    onChangePitch(0);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-orange-600" />
            Voice Selection & Customization Controls
          </h3>
          <p className="text-[11px] text-stone-500">
            Choose from the 8 KittenTTS speaker profiles or your uploaded custom personas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={disabled || (speed === 1.0 && pitch === 0)}
          className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 self-start sm:self-auto transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-stone-400" />
          <span>Reset Pitch & Speed</span>
        </button>
      </div>

      {/* Cloned Personas Bar if any exist */}
      {customPersonas.length > 0 && (
        <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-orange-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              My Uploaded Voice Personas & Clones ({customPersonas.length})
            </span>
            {onNavigateToCloning && (
              <button
                type="button"
                onClick={onNavigateToCloning}
                className="text-[11px] text-orange-700 hover:text-orange-900 font-medium underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add More Clones
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {customPersonas.map((cp) => {
              const isSelected = selectedVoice === cp.name || selectedVoice === cp.id;

              return (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => onSelectVoice(cp.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                      : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                  }`}
                >
                  <span>{cp.name}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                    isSelected ? 'bg-orange-700 text-orange-100' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {cp.basePitchHz}Hz
                  </span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 8-Voice Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {voiceKeys.map((vKey) => {
          const spec = KITTEN_VOICES[vKey];
          const isSelected = selectedVoice === vKey;

          return (
            <button
              key={vKey}
              type="button"
              disabled={disabled}
              onClick={() => onSelectVoice(vKey)}
              className={`p-3 rounded-xl transition-all border text-left cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500/30 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 text-sm">
                      {spec.name}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {spec.gender === 'Female' ? '♀' : '♂'}
                    </span>
                  </div>
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-mono">
                      {spec.basePitchHz}Hz
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium text-stone-700 mb-0.5 truncate">
                  {spec.timbre}
                </div>

                <p className="text-[10px] text-stone-500 line-clamp-2 leading-tight">
                  {spec.description}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                <span className="truncate max-w-[80px]">{spec.accent}</span>
                <span className="font-mono text-stone-500">{spec.gender}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Voice Customization Parameters Panel */}
      <div className="p-4 sm:p-5 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-5">
        {/* Active Voice Summary & Live Telemetry Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
              {currentSpec.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 text-sm">
                  {currentSpec.name} ({currentSpec.gender})
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-xs text-orange-700 font-medium">
                  {currentSpec.timbre}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Acoustic baseline: {currentSpec.basePitchHz} Hz · {currentSpec.accent}
              </p>
            </div>
          </div>

          {/* Quick Audition Button */}
          <button
            type="button"
            disabled={disabled || isAuditioning}
            onClick={handleAudition}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-60"
          >
            {isAuditioning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditioning...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audition Custom Voice</span>
              </>
            )}
          </button>
        </div>

        {/* Sliders Grid: Speed & Pitch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Speed / Rate Control */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="tts-speed-slider" className="text-xs font-semibold text-stone-800 flex items-center gap-1.5 cursor-pointer">
                <Gauge className="w-4 h-4 text-orange-600" />
                <span>Speed / Speech Rate</span>
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold font-mono text-stone-900">
                  {speed.toFixed(2)}x
                </span>
                <span className="text-[11px] text-stone-500">
                  {speed === 1.0 ? '(Normal)' : speed > 1.0 ? `(+${Math.round((speed - 1) * 100)}% faster)` : `(-${Math.round((1 - speed) * 100)}% slower)`}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <input
                id="tts-speed-slider"
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={speed}
                disabled={disabled}
                onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>0.50x Slow</span>
                <span className={speed === 1.0 ? 'text-orange-600 font-semibold' : ''}>1.00x Normal</span>
                <span>2.00x Fast</span>
              </div>
            </div>

            {/* Quick Speed Preset Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-stone-400 shrink-0">Presets:</span>
              {[0.75, 1.0, 1.25, 1.5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChangeSpeed(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                    speed === preset
                      ? 'bg-orange-100 text-orange-800 font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {preset.toFixed(2)}x
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pitch Control */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="tts-pitch-slider" className="text-xs font-semibold text-stone-800 flex items-center gap-1.5 cursor-pointer">
                <Music className="w-4 h-4 text-orange-600" />
                <span>Pitch Offset</span>
              </label>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold font-mono text-stone-900">
                  {pitch > 0 ? `+${pitch}%` : `${pitch}%`}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  ({effectivePitchHz} Hz · {pitch >= 0 ? `+${semitones}` : semitones} st)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <input
                id="tts-pitch-slider"
                type="range"
                min={-50}
                max={50}
                step={1}
                value={pitch}
                disabled={disabled}
                onChange={(e) => onChangePitch(parseInt(e.target.value, 10))}
                className="w-full accent-orange-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>-50% Deep</span>
                <span className={pitch === 0 ? 'text-orange-600 font-semibold' : ''}>0% Natural</span>
                <span>+50% High</span>
              </div>
            </div>

            {/* Quick Pitch Preset Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-stone-400 shrink-0">Presets:</span>
              {[-25, -10, 0, 10, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChangePitch(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                    pitch === preset
                      ? 'bg-orange-100 text-orange-800 font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {preset > 0 ? `+${preset}%` : `${preset}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style Persona Combination Presets */}
        <div className="pt-2 border-t border-stone-200/70 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Style Combinations:
          </span>
          {STYLE_PRESETS.map((preset) => {
            const isActive = speed === preset.speed && pitch === preset.pitch;

            return (
              <button
                key={preset.label}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChangeSpeed(preset.speed);
                  onChangePitch(preset.pitch);
                }}
                title={preset.desc}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-200/70 text-stone-700 border border-stone-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
