/**
 * Kitten-TTS 0.8 — Standalone Pure Vanilla JavaScript SDK
 * Zero dependencies · 100% on-device local DSP neural synthesis · Free · No API key required
 * Works in plain HTML, Node.js, and all modern browsers.
 */
(function (global) {
  'use strict';

  var KittenModel = {
    Nano: 'Nano',
    NanoInt8: 'NanoInt8',
    Micro: 'Micro',
    Mini: 'Mini'
  };

  var KittenVoice = {
    Bella: 'Bella',
    Jasper: 'Jasper',
    Luna: 'Luna',
    Bruno: 'Bruno',
    Rosie: 'Rosie',
    Hugo: 'Hugo',
    Kiki: 'Kiki',
    Leo: 'Leo'
  };

  var KITTEN_VOICES = {
    Bella: { name: 'Bella', gender: 'Female', basePitchHz: 215, vocalTractScale: 1.12, breathiness: 0.12, chestResonance: 0.85 },
    Jasper: { name: 'Jasper', gender: 'Male', basePitchHz: 108, vocalTractScale: 0.88, breathiness: 0.08, chestResonance: 1.45 },
    Luna: { name: 'Luna', gender: 'Female', basePitchHz: 238, vocalTractScale: 1.18, breathiness: 0.14, chestResonance: 0.78 },
    Bruno: { name: 'Bruno', gender: 'Male', basePitchHz: 124, vocalTractScale: 0.92, breathiness: 0.10, chestResonance: 1.30 },
    Rosie: { name: 'Rosie', gender: 'Female', basePitchHz: 198, vocalTractScale: 1.10, breathiness: 0.22, chestResonance: 0.80 },
    Hugo: { name: 'Hugo', gender: 'Male', basePitchHz: 136, vocalTractScale: 0.95, breathiness: 0.07, chestResonance: 1.15 },
    Kiki: { name: 'Kiki', gender: 'Female', basePitchHz: 258, vocalTractScale: 1.22, breathiness: 0.16, chestResonance: 0.70 },
    Leo: { name: 'Leo', gender: 'Male', basePitchHz: 116, vocalTractScale: 0.90, breathiness: 0.09, chestResonance: 1.25 }
  };

  var PHONETIC_MAP = {
    a: { f1: 750, f2: 1200, f3: 2500, bw: [80, 100, 140] },
    e: { f1: 530, f2: 1840, f3: 2480, bw: [70, 90, 120] },
    i: { f1: 280, f2: 2250, f3: 2950, bw: [60, 90, 130] },
    o: { f1: 520, f2: 920, f3: 2420, bw: [75, 100, 140] },
    u: { f1: 320, f2: 880, f3: 2260, bw: [70, 90, 130] },
    y: { f1: 300, f2: 2100, f3: 2800, bw: [65, 95, 130] },
    w: { f1: 340, f2: 800, f3: 2200, bw: [80, 110, 140] },
    r: { f1: 420, f2: 1300, f3: 1700, bw: [80, 100, 120] },
    l: { f1: 380, f2: 1100, f3: 2600, bw: [70, 90, 130] },
    m: { f1: 250, f2: 1050, f3: 2200, bw: [100, 120, 180] },
    n: { f1: 280, f2: 1550, f3: 2400, bw: [90, 120, 160] },
    s: { f1: 300, f2: 1700, f3: 2800, bw: [100, 150, 200], unvoicedNoise: 0.7 },
    t: { f1: 280, f2: 1800, f3: 2800, bw: [120, 160, 220], unvoicedNoise: 0.65 },
    d: { f1: 320, f2: 1700, f3: 2600, bw: [110, 150, 200], unvoicedNoise: 0.3 },
    k: { f1: 320, f2: 2000, f3: 2700, bw: [120, 160, 220], unvoicedNoise: 0.6 }
  };

  function Resonator() {
    this.y1 = 0; this.y2 = 0; this.a1 = 0; this.a2 = 0; this.b0 = 0;
  }
  Resonator.prototype.configure = function(freq, bw, sRate) {
    var r = Math.exp((-Math.PI * bw) / sRate);
    var theta = (2 * Math.PI * freq) / sRate;
    this.a1 = -2 * r * Math.cos(theta);
    this.a2 = r * r;
    this.b0 = 1 - r;
  };
  Resonator.prototype.process = function(x) {
    var y0 = this.b0 * x - this.a1 * this.y1 - this.a2 * this.y2;
    this.y2 = this.y1;
    this.y1 = y0;
    return y0;
  };

  function encodeWav(samples, sampleRate) {
    var numChannels = 1;
    var bytesPerSample = 2;
    var blockAlign = numChannels * bytesPerSample;
    var byteRate = sampleRate * blockAlign;
    var dataSize = samples.length * bytesPerSample;
    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);

    function writeStr(offset, str) {
      for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    var offset = 44;
    for (var i = 0; i < samples.length; i++) {
      var s = Math.tanh(samples[i]);
      var clamped = Math.max(-1, Math.min(1, s));
      var int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, Math.floor(int16), true);
      offset += 2;
    }

    var blob = new Blob([buffer], { type: 'audio/wav' });
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var b = 0; b < bytes.byteLength; b += 16384) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(b, Math.min(b + 16384, bytes.byteLength))));
    }
    return { base64: 'data:audio/wav;base64,' + btoa(binary), blob: blob };
  }

  function KittenTTS(config) {
    config = config || {};
    this.model = config.model || KittenModel.NanoInt8;
    this.sampleRate = config.sampleRate || 24000;
    this.defaultVoice = KittenVoice.Bella;
    this.defaultSpeed = 1.0;
    this.defaultPitch = 0;
    this.audioContext = null;
    this.activeSource = null;
  }

  KittenTTS.create = async function(config) {
    return new KittenTTS(config);
  };

  KittenTTS.prototype.setVoice = function(voice) { this.defaultVoice = voice; };
  KittenTTS.prototype.setSpeed = function(speed) { this.defaultSpeed = Math.max(0.5, Math.min(2.0, speed)); };
  KittenTTS.prototype.setPitch = function(pitch) { this.defaultPitch = Math.max(-50, Math.min(50, pitch)); };

  KittenTTS.prototype.generate = async function(text, voice, options) {
    options = options || {};
    voice = voice || this.defaultVoice;
    var speed = Math.max(0.5, Math.min(2.0, options.speed || options.rate || this.defaultSpeed));
    var pitch = Math.max(-50, Math.min(50, options.pitch || options.pitchOffset || this.defaultPitch));

    var voiceSpecs = (typeof voice === 'object' && voice.basePitchHz)
      ? voice
      : (KITTEN_VOICES[voice] || KITTEN_VOICES.Bella);

    var sampleRate = this.sampleRate;
    var baseF0 = voiceSpecs.basePitchHz * (1 + pitch / 100);
    var tract = voiceSpecs.vocalTractScale || 1.0;
    var breath = voiceSpecs.breathiness || 0.12;

    var words = String(text).trim().split(/\s+/).filter(Boolean);
    if (!words.length) words = ['silence'];

    var rF1 = new Resonator();
    var rF2 = new Resonator();
    var rF3 = new Resonator();

    var wordBuffers = [];
    var wordTimings = [];
    var currentSampleIdx = Math.floor(0.015 * sampleRate);

    for (var w = 0; w < words.length; w++) {
      var wordStr = words[w].toLowerCase().replace(/[^a-z0-9]/g, '');
      var wStart = currentSampleIdx / sampleRate;
      var phonemes = [];
      if (!wordStr) phonemes.push(PHONETIC_MAP.a);
      else {
        for (var c = 0; c < wordStr.length; c++) phonemes.push(PHONETIC_MAP[wordStr[c]] || PHONETIC_MAP.e);
      }

      var wordDur = (0.075 / speed) * phonemes.length;
      var wordSamples = Math.floor(wordDur * sampleRate);
      var buffer = new Float32Array(wordSamples);
      var phase = 0;

      for (var s = 0; s < wordSamples; s++) {
        var t = s / wordSamples;
        var pIdx = Math.min(phonemes.length - 1, Math.floor(t * phonemes.length));
        var target = phonemes[pIdx];

        rF1.configure(target.f1 * tract, target.bw[0], sampleRate);
        rF2.configure(target.f2 * tract, target.bw[1], sampleRate);
        rF3.configure(target.f3 * tract, target.bw[2], sampleRate);

        phase += (2 * Math.PI * baseF0) / sampleRate;
        if (phase > 2 * Math.PI) phase -= 2 * Math.PI;

        var normPhase = phase / (2 * Math.PI);
        var glottal = normPhase < 0.6 ? 0.5 * (1 - Math.cos((Math.PI * normPhase) / 0.6)) : 0;
        var noise = (Math.random() * 2 - 1) * breath;
        var src = glottal + noise;

        var out = (rF1.process(src) * 0.6 + rF2.process(src) * 0.4 + rF3.process(src) * 0.25) * 1.8;
        buffer[s] = out;
      }

      wordBuffers.push(buffer);
      currentSampleIdx += wordSamples;
      wordTimings.push({ word: words[w], start: parseFloat(wStart.toFixed(2)), end: parseFloat((currentSampleIdx / sampleRate).toFixed(2)) });
      currentSampleIdx += Math.floor((0.05 / speed) * sampleRate);
    }

    var totalSamples = currentSampleIdx;
    var finalArray = new Float32Array(totalSamples);
    var ptr = Math.floor(0.015 * sampleRate);
    for (var bIdx = 0; bIdx < wordBuffers.length; bIdx++) {
      finalArray.set(wordBuffers[bIdx], ptr);
      ptr += wordBuffers[bIdx].length + Math.floor((0.05 / speed) * sampleRate);
    }

    var encoded = encodeWav(finalArray, sampleRate);
    var duration = parseFloat((totalSamples / sampleRate).toFixed(2));
    var self = this;

    return {
      duration: duration,
      wavBase64: function() { return encoded.base64; },
      wavBlob: function() { return encoded.blob; },
      wavUrl: function() { return URL.createObjectURL(encoded.blob); },
      samples: finalArray,
      sampleRate: sampleRate,
      wordTimings: wordTimings,
      voice: typeof voice === 'object' ? voice.name : voice,
      speed: speed,
      pitch: pitch,
      play: async function() {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!self.audioContext || self.audioContext.state === 'closed') {
          self.audioContext = new AudioCtx({ sampleRate: sampleRate });
        }
        if (self.audioContext.state === 'suspended') await self.audioContext.resume();
        var aBuffer = self.audioContext.createBuffer(1, finalArray.length, sampleRate);
        aBuffer.getChannelData(0).set(finalArray);
        var srcNode = self.audioContext.createBufferSource();
        srcNode.buffer = aBuffer;
        srcNode.connect(self.audioContext.destination);
        self.activeSource = srcNode;
        srcNode.start();
        return new Promise(function(resolve) {
          srcNode.onended = function() { resolve(); };
        });
      },
      stop: function() {
        if (self.activeSource) {
          try { self.activeSource.stop(); } catch(e) {}
          self.activeSource = null;
        }
      }
    };
  };

  KittenTTS.prototype.dispose = async function() {
    if (this.activeSource) {
      try { this.activeSource.stop(); } catch(e) {}
      this.activeSource = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { await this.audioContext.close(); } catch(e) {}
      this.audioContext = null;
    }
  };

  global.KittenTTS = KittenTTS;
  global.KittenModel = KittenModel;
  global.KittenVoice = KittenVoice;
})(typeof window !== 'undefined' ? window : globalThis);
