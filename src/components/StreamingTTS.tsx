/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KittenModel, KittenVoice, KittenTTS, KittenStreamChunk } from '../lib/kitten-tts';
import { Play, Pause, Radio, RefreshCw, Layers } from 'lucide-react';

interface StreamingTTSProps {
  currentModel: KittenModel;
  currentVoice: KittenVoice;
}

export const StreamingTTS: React.FC<StreamingTTSProps> = ({ currentModel, currentVoice }) => {
  const [streamText, setStreamText] = useState(
    'Kitten-TTS 0.8 enables seamless on-device streaming for long text passages. ' +
    'The neural engine slices continuous prose into acoustic phrases with zero cloud roundtrips. ' +
    'First audio chunk begins playback almost instantly while subsequent phrases synthesize in parallel. ' +
    'This guarantees smooth, low-latency audiobooks and real-time voice assistant responses.'
  );

  const [isStreaming, setIsStreaming] = useState(false);
  const [chunks, setChunks] = useState<KittenStreamChunk[]>([]);
  const [playingChunkIndex, setPlayingChunkIndex] = useState<number | null>(null);

  const handleStartStreaming = async () => {
    if (!streamText.trim() || isStreaming) return;
    setIsStreaming(true);
    setChunks([]);
    setPlayingChunkIndex(null);

    try {
      const tts = await KittenTTS.create({ model: currentModel });

      await tts.stream(streamText, currentVoice, (chunk) => {
        setChunks((prev) => [...prev, chunk]);
      });

      await tts.dispose();
    } catch (err) {
      console.error('Streaming error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handlePlayChunk = (chunkIndex: number, wavBase64: string) => {
    if (playingChunkIndex === chunkIndex) {
      setPlayingChunkIndex(null);
      return;
    }

    const audio = new Audio(wavBase64);
    setPlayingChunkIndex(chunkIndex);
    audio.play();
    audio.onended = () => {
      setPlayingChunkIndex(null);
    };
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-stone-900 text-base">
                Streaming TTS Pipeline
              </h2>
              <span className="text-xs bg-orange-100 text-orange-800 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                <Radio className="w-3 h-3 text-orange-600 animate-pulse" />
                Chunk-By-Chunk Parallelism
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              For long-form narration and LLM token outputs. The client plays the first phrase immediately while subsequent chunks synthesize in the background.
            </p>
          </div>

          <button
            type="button"
            disabled={isStreaming}
            onClick={handleStartStreaming}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-60"
          >
            {isStreaming ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Stream...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Streaming Synthesis</span>
              </>
            )}
          </button>
        </div>

        <textarea
          rows={4}
          value={streamText}
          onChange={(e) => setStreamText(e.target.value)}
          placeholder="Enter long paragraph to test streaming phrases..."
          className="w-full text-xs sm:text-sm border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 leading-relaxed"
        />

        {/* Chunks Progress & Timeline */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs mb-3 text-stone-600">
            <span className="font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400" />
              Stream Queue: {chunks.length} Chunks Produced
            </span>
            <span className="text-[11px] text-stone-400">
              Active Voice: <strong>{currentVoice}</strong> · Model: <strong>{currentModel}</strong>
            </span>
          </div>

          {chunks.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400 border border-stone-200 border-dashed rounded-xl bg-stone-50/50">
              Click &quot;Start Streaming Synthesis&quot; to test real-time chunk generation
            </div>
          ) : (
            <div className="space-y-2">
              {chunks.map((chunk) => {
                const isPlaying = playingChunkIndex === chunk.chunkIndex;

                return (
                  <div
                    key={chunk.chunkIndex}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <span className="font-mono text-[10px] text-orange-600 font-semibold bg-orange-100/70 px-1.5 py-0.5 rounded shrink-0">
                        Chunk #{chunk.chunkIndex + 1}
                      </span>
                      <p className="text-stone-800 text-xs truncate max-w-lg">
                        &ldquo;{chunk.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[11px] text-stone-500">
                        {chunk.duration}s
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlayChunk(chunk.chunkIndex, chunk.wavBase64)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-orange-600 text-white'
                            : 'bg-white hover:bg-stone-200/70 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-3 h-3 fill-white" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-stone-700" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
