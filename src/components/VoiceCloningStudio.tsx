/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  KittenVoicePersona,
  KittenTTS,
  KittenModel,
  KittenVoice,
} from '../lib/kitten-tts';
import {
  analyzeAudioRecording,
  decodeAudioFile,
  VoiceAnalysisResult,
} from '../lib/audio-pitch-extractor';
import {
  Upload,
  Mic,
  Square,
  Sparkles,
  Check,
  Volume2,
  Trash2,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Radio,
  FileAudio,
} from 'lucide-react';

interface VoiceCloningStudioProps {
  currentModel: KittenModel;
  onSelectPersonaAsActive: (persona: KittenVoicePersona) => void;
  activePersonaId?: string;
  customPersonas: KittenVoicePersona[];
  setCustomPersonas: React.Dispatch<React.SetStateAction<KittenVoicePersona[]>>;
}

interface ServerApiStatus {
  configured: boolean;
  mode: string;
  keyPreview: string | null;
  message: string;
}

export const VoiceCloningStudio: React.FC<VoiceCloningStudioProps> = ({
  currentModel,
  onSelectPersonaAsActive,
  activePersonaId,
  customPersonas,
  setCustomPersonas,
}) => {
  // Server API key status
  const [apiStatus, setApiStatus] = useState<ServerApiStatus | null>(null);
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  // Kitten Website clone ID input
  const [websiteCloneId, setWebsiteCloneId] = useState('my-custom-clone');
  const [websiteCloneName, setWebsiteCloneName] = useState('Account Cloned Voice');
  const [isLinkingClone, setIsLinkingClone] = useState(false);

  // Audio Recording & Upload State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

  // New Persona form fields
  const [personaName, setPersonaName] = useState('My Custom Voice Persona');
  const [personaGender, setPersonaGender] = useState<'Female' | 'Male' | 'Custom'>('Custom');
  const [personaPitch, setPersonaPitch] = useState<number>(180);
  const [personaTimbre, setPersonaTimbre] = useState('Warm Studio Resonant');
  const [personaDescription, setPersonaDescription] = useState('Custom voice persona created from personal audio recording.');

  // Audition playback
  const [auditioningId, setAuditioningId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check server API status on mount
  useEffect(() => {
    checkServerApi();
  }, []);

  const checkServerApi = async () => {
    setIsCheckingApi(true);
    try {
      const res = await fetch('/api/kitten/status');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(data);
      }
    } catch (err) {
      console.warn('Could not contact /api/kitten/status, server may be offline:', err);
    } finally {
      setIsCheckingApi(false);
    }
  };

  // Handle linking clone from Kitten TTS Website account
  const handleLinkWebsiteClone = async () => {
    if (!websiteCloneId.trim()) return;
    setIsLinkingClone(true);

    try {
      // Sync with server
      await fetch('/api/kitten/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneId: websiteCloneId.trim(),
          name: websiteCloneName.trim() || 'Kitten Website Cloned Voice',
          basePitchHz: 175,
          timbre: 'Website Neural Clone',
          description: `Voice cloned from Kitten TTS user account (ID: ${websiteCloneId.trim()})`,
        }),
      });

      const newPersona: KittenVoicePersona = {
        id: `web_clone_${Date.now()}`,
        name: websiteCloneName.trim() || 'Kitten Website Cloned Voice',
        isCloned: true,
        cloneId: websiteCloneId.trim(),
        gender: 'Custom',
        basePitchHz: 175,
        vocalTractScale: 1.05,
        breathiness: 0.1,
        chestResonance: 1.1,
        timbre: 'Website Neural Clone',
        description: `Linked from Kitten TTS Account · Clone ID: ${websiteCloneId.trim()}`,
        createdAt: new Date().toLocaleDateString(),
      };

      setCustomPersonas((prev) => [newPersona, ...prev]);
      onSelectPersonaAsActive(newPersona);
    } catch (err) {
      console.error('Failed to link website clone:', err);
    } finally {
      setIsLinkingClone(false);
    }
  };

  // Handle File Upload (.wav, .mp3, etc.)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setRecordedAudioBlob(file);
    setIsAnalyzing(true);

    try {
      const decodedBuffer = await decodeAudioFile(file);
      const analysis = await analyzeAudioRecording(decodedBuffer);
      setAnalysisResult(analysis);
      setPersonaPitch(analysis.basePitchHz);
      setPersonaGender(analysis.estimatedGender);
      setPersonaTimbre(analysis.timbre);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setPersonaName(`${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)} Persona`);
    } catch (err) {
      console.error('Error analyzing audio file:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudioBlob(audioBlob);
        setUploadedFileName('Microphone Recording');
        setIsAnalyzing(true);

        try {
          const decoded = await decodeAudioFile(audioBlob);
          const analysis = await analyzeAudioRecording(decoded);
          setAnalysisResult(analysis);
          setPersonaPitch(analysis.basePitchHz);
          setPersonaGender(analysis.estimatedGender);
          setPersonaTimbre(analysis.timbre);
        } catch (err) {
          console.error('Analysis error:', err);
        } finally {
          setIsAnalyzing(false);
        }

        // stop mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to open microphone:', err);
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Save Persona
  const handleSavePersona = async () => {
    if (!personaName.trim()) return;

    const newPersona: KittenVoicePersona = {
      id: `persona_${Date.now()}`,
      name: personaName.trim(),
      isCloned: true,
      cloneId: `local_clone_${Date.now()}`,
      gender: personaGender,
      basePitchHz: personaPitch,
      vocalTractScale: analysisResult?.vocalTractScale || (personaGender === 'Female' ? 1.15 : 0.95),
      breathiness: analysisResult?.breathiness || 0.12,
      chestResonance: analysisResult?.chestResonance || 1.1,
      timbre: personaTimbre,
      description: personaDescription,
      sampleAudioDurationSec: analysisResult?.durationSec || 3.0,
      createdAt: new Date().toLocaleDateString(),
    };

    // Save to server registry
    try {
      await fetch('/api/kitten/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloneId: newPersona.cloneId,
          name: newPersona.name,
          gender: newPersona.gender,
          basePitchHz: newPersona.basePitchHz,
          timbre: newPersona.timbre,
          description: newPersona.description,
          durationSec: newPersona.sampleAudioDurationSec,
        }),
      });
    } catch (err) {
      console.warn('Could not sync with server /api/kitten/clone, saving locally:', err);
    }

    setCustomPersonas((prev) => [newPersona, ...prev]);
    onSelectPersonaAsActive(newPersona);

    // Reset upload form
    setAnalysisResult(null);
    setUploadedFileName(null);
    setRecordedAudioBlob(null);
  };

  // Delete Persona
  const handleDeletePersona = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPersonas((prev) => prev.filter((p) => p.id !== id));
  };

  // Audition Persona
  const handleAuditionPersona = async (persona: KittenVoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();
    if (auditioningId) return;
    setAuditioningId(persona.id);

    try {
      const tts = await KittenTTS.create({ model: currentModel });
      const sample = `Hello! This is my cloned voice persona, ${persona.name}. Synthesized directly on device.`;
      const res = await tts.generate(sample, persona);
      await res.play();
      await tts.dispose();
    } catch (err) {
      console.error('Audition error:', err);
    } finally {
      setAuditioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Kitten TTS API Key & Server Status Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              apiStatus?.configured
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-stone-100 text-stone-600'
            }`}>
              <Key className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900 text-sm">
                  Kitten TTS API Key & Cloud Cloning Connection
                </h3>
                {apiStatus?.configured ? (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Key Active ({apiStatus.keyPreview})
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    Offline Local Engine (0 API Key Required)
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {apiStatus?.message || 'Checking Kitten TTS server proxy status...'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isCheckingApi}
            onClick={checkServerApi}
            className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-medium self-start sm:self-auto transition-colors cursor-pointer"
          >
            {isCheckingApi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Refresh Status'}
          </button>
        </div>

        {!apiStatus?.configured && (
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              To leverage your Kitten TTS API Key for cloud clones, set <code className="text-stone-800 font-mono bg-stone-100 px-1 py-0.5 rounded">KITTEN_TTS_API_KEY</code> in your server environment or <code className="text-stone-800 font-mono bg-stone-100 px-1 py-0.5 rounded">.env</code> file.
            </span>
          </div>
        )}
      </div>

      {/* 2. Grid: Use Website Account Clone & Upload Custom Voice Recording */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* A. Kitten Website Account Clone Connector */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Radio className="w-4 h-4 text-orange-600" />
              <h3 className="font-semibold text-stone-900 text-sm">
                Connect Account Clone from Kitten TTS Website
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              If you generated a voice clone on the Kitten TTS website portal, link its Clone ID to synthesize with it directly in this app.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 mb-1 block">
                  Kitten Website Clone ID:
                </label>
                <input
                  type="text"
                  value={websiteCloneId}
                  onChange={(e) => setWebsiteCloneId(e.target.value)}
                  placeholder="e.g. clone_user_alex_v1 or my-custom-clone"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 mb-1 block">
                  Persona Display Label:
                </label>
                <input
                  type="text"
                  value={websiteCloneName}
                  onChange={(e) => setWebsiteCloneName(e.target.value)}
                  placeholder="e.g. My Website Studio Voice"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                <span>Quick examples:</span>
                {['my-custom-clone', 'studio-narrator-clone', 'podcast-host-v2'].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setWebsiteCloneId(ex);
                      setWebsiteCloneName(ex.replace(/-/g, ' '));
                    }}
                    className="underline hover:text-stone-700 font-mono"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              Synced with server proxy
            </span>

            <button
              type="button"
              disabled={isLinkingClone || !websiteCloneId.trim()}
              onClick={handleLinkWebsiteClone}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLinkingClone ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Linking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Import Cloned Voice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* B. Upload Custom Voice Recording / Mic */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Upload className="w-4 h-4 text-orange-600" />
              <h3 className="font-semibold text-stone-900 text-sm">
                Upload Voice Recording for Custom Persona
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Upload a 3–15 second audio recording of your voice, or record from your microphone. Our on-device DSP extracts acoustic pitch ($F_0$) and resonant formants.
            </p>

            {/* Upload or Record Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.ogg"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 border border-stone-200 border-dashed rounded-xl bg-stone-50/70 hover:bg-stone-100/70 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <FileAudio className="w-5 h-5 text-stone-500" />
                <span className="text-xs font-medium text-stone-800">Choose Audio File</span>
                <span className="text-[10px] text-stone-400">.WAV, .MP3, .M4A</span>
              </button>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                  isRecording
                    ? 'border-rose-500 bg-rose-50 text-rose-700 animate-pulse'
                    : 'border-stone-200 border-dashed bg-stone-50/70 hover:bg-stone-100/70 text-stone-800'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 fill-rose-600 text-rose-600" />
                    <span className="text-xs font-semibold">Stop Recording ({recordingSeconds}s)</span>
                    <span className="text-[10px] text-rose-500">Click to finish</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-stone-500" />
                    <span className="text-xs font-medium">Record Voice</span>
                    <span className="text-[10px] text-stone-400">Speak 5 seconds</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Feedback Banner */}
            {isAnalyzing && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                <span>Extracting fundamental frequency (F0) & vocal tract acoustics...</span>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-orange-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    Acoustic Profile Extracted ({uploadedFileName})
                  </span>
                  <span className="font-mono text-orange-800 font-bold">{analysisResult.basePitchHz} Hz</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
                  <div>Estimated Pitch: <strong>{analysisResult.basePitchHz} Hz ({analysisResult.estimatedGender})</strong></div>
                  <div>Sample Duration: <strong>{analysisResult.durationSec}s</strong></div>
                  <div>Detected Timbre: <strong>{analysisResult.timbre}</strong></div>
                  <div>Tract Scale: <strong>{analysisResult.vocalTractScale.toFixed(2)}</strong></div>
                </div>

                {/* Waveform Thumbnail */}
                <div className="flex items-end gap-0.5 h-6 pt-1">
                  {analysisResult.waveformPreview.map((amp, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(15, amp * 100)}%` }}
                      className="flex-1 bg-orange-400 rounded-xs"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Persona Save Form */}
          {analysisResult && !isAnalyzing && (
            <div className="pt-4 mt-4 border-t border-stone-100 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Persona Name:</label>
                  <input
                    type="text"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 mb-1 block">Calibrated Pitch (Hz):</label>
                  <input
                    type="number"
                    min={80}
                    max={360}
                    value={personaPitch}
                    onChange={(e) => setPersonaPitch(parseInt(e.target.value, 10) || 160)}
                    className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePersona}
                className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Set as Active Voice Persona</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. My Saved Voice Personas Library */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">
              My Cloned Voice Personas Library ({customPersonas.length})
            </h3>
            <p className="text-xs text-stone-500">
              Personal voice models ready to synthesize any text in the Studio, Voice Matrix, or Vanilla JS.
            </p>
          </div>
        </div>

        {customPersonas.length === 0 ? (
          <div className="p-8 border border-stone-200 border-dashed rounded-xl text-center bg-stone-50/50">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold text-stone-800 mb-1">
              No Custom Personas Yet
            </h4>
            <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
              Upload an audio sample or link a Kitten TTS website clone above to create your custom voice personas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customPersonas.map((persona) => {
              const isActive = activePersonaId === persona.id;
              const isAuditioning = auditioningId === persona.id;

              return (
                <div
                  key={persona.id}
                  onClick={() => onSelectPersonaAsActive(persona)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isActive
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">
                          {persona.name}
                        </span>
                        <span className="text-[10px] font-mono text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                          {persona.isCloned ? 'Cloned' : 'Persona'}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-medium text-stone-700 mb-1">
                      {persona.timbre} · <span className="font-mono text-stone-500">{persona.basePitchHz} Hz</span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-3">
                      {persona.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {persona.createdAt || 'Local'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title="Audition Persona"
                        onClick={(e) => handleAuditionPersona(persona, e)}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {isAuditioning ? (
                          <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-stone-500" />
                        )}
                        <span>Sample</span>
                      </button>

                      <button
                        type="button"
                        title="Delete Persona"
                        onClick={(e) => handleDeletePersona(persona.id, e)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
