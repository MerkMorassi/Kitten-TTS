/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KittenModel, KITTEN_MODELS } from '../lib/kitten-tts';
import { Cpu, Zap, Layers, CheckCircle2 } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: KittenModel;
  onSelectModel: (model: KittenModel) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  const models = [
    KittenModel.NanoInt8,
    KittenModel.Nano,
    KittenModel.Micro,
    KittenModel.Mini,
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Neural Model Architecture
        </label>
        <span className="text-[11px] text-stone-400">
          Stored locally in memory / IndexedDB
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {models.map((modelKey) => {
          const spec = KITTEN_MODELS[modelKey];
          const isSelected = selectedModel === modelKey;

          return (
            <button
              key={modelKey}
              type="button"
              disabled={disabled}
              onClick={() => onSelectModel(modelKey)}
              className={`p-3 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-500/20'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
                    {spec.name}
                    {modelKey === KittenModel.NanoInt8 && (
                      <span className="text-[10px] font-medium text-orange-700 bg-orange-100/80 px-1.5 py-0.2 rounded">
                        Fastest
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed mb-2.5 line-clamp-2">
                  {spec.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                <span className="flex items-center gap-1 font-mono text-stone-700">
                  <Layers className="w-3 h-3 text-stone-400" />
                  {spec.parameters}
                </span>
                <span className="flex items-center gap-1 text-stone-500 font-mono">
                  <Cpu className="w-3 h-3 text-stone-400" />
                  {spec.downloadSize}
                </span>
                <span className="flex items-center gap-1 font-mono text-emerald-700">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  ~{spec.latencyMs}ms
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
