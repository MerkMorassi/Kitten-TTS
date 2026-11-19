/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KittenVoice, KITTEN_VOICES, KittenTTS } from '../lib/kitten-tts';
import { Volume2, Check, Loader2 } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: KittenVoice;
  onSelectVoice: (voice: KittenVoice) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled = false,
}) => {
  const [playingVoice, setPlayingVoice] = useState<KittenVoice | null>(null);

  const voicesList = [
    KittenVoice.Bella,
    KittenVoice.Jasper,
    KittenVoice.Luna,
    KittenVoice.Bruno,
    KittenVoice.Rosie,
    KittenVoice.Hugo,
    KittenVoice.Kiki,
    KittenVoice.Leo,
  ];

  const handlePreviewVoice = async (e: React.MouseEvent, voice: KittenVoice) => {
    e.stopPropagation();
    if (playingVoice) return;

    try {
      setPlayingVoice(voice);
      const tts = await KittenTTS.create();
      const spec = KITTEN_VOICES[voice];
      const previewText = `Hi, I'm ${spec.name}. ${spec.sampleQuote}`;
      const res = await tts.generate(previewText, voice);
      await res.play();
      await tts.dispose();
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPlayingVoice(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Speaker Voice Profiles (8 Built-In Profiles)
        </label>
        <span className="text-[11px] text-stone-400">
          Embedded weights · Zero cloud streaming
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {voicesList.map((voiceKey) => {
          const spec = KITTEN_VOICES[voiceKey];
          const isSelected = selectedVoice === voiceKey;
          const isPreviewing = playingVoice === voiceKey;

          return (
            <div
              key={voiceKey}
              onClick={() => !disabled && onSelectVoice(voiceKey)}
              className={`p-3 rounded-xl transition-all border text-left cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900 text-sm">
                      {spec.name}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {spec.gender === 'Female' ? '♀' : '♂'} {spec.gender}
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

                <div className="text-[11px] font-medium text-stone-700 mb-1">
                  {spec.timbre}
                </div>

                <p className="text-[11px] text-stone-500 leading-snug line-clamp-2 mb-2">
                  {spec.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 truncate max-w-[100px]">
                  {spec.accent}
                </span>

                <button
                  type="button"
                  title={`Preview ${spec.name}'s voice`}
                  onClick={(e) => handlePreviewVoice(e, voiceKey)}
                  className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 font-medium transition-colors ${
                    isPreviewing
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-orange-100 hover:text-orange-800'
                  }`}
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-stone-500 group-hover:text-orange-600" />
                      <span>Sample</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
