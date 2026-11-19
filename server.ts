/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ClonedVoiceRecord {
  cloneId: string;
  name: string;
  gender: 'Female' | 'Male' | 'Custom';
  basePitchHz: number;
  timbre: string;
  description: string;
  sampleAudioDurationSec: number;
  createdAt: string;
}

// In-memory registry for uploaded voice clones on the server
const registeredClones: Map<string, ClonedVoiceRecord> = new Map();

// Seed with default cloud clone account example
registeredClones.set('my-custom-clone', {
  cloneId: 'my-custom-clone',
  name: 'Account Cloned Voice (Kitten Web)',
  gender: 'Custom',
  basePitchHz: 180,
  timbre: 'Studio Neutral Clone',
  description: 'Cloned voice created via Kitten TTS account web portal.',
  sampleAudioDurationSec: 5.4,
  createdAt: new Date().toISOString(),
});

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Route: Check API Key status
  app.get('/api/kitten/status', (_req, res) => {
    const hasKey = Boolean(process.env.KITTEN_TTS_API_KEY && process.env.KITTEN_TTS_API_KEY !== 'MY_KITTEN_TTS_API_KEY');
    res.json({
      configured: hasKey,
      mode: hasKey ? 'cloud_and_local' : 'local_dsp_offline',
      keyPreview: hasKey ? `${process.env.KITTEN_TTS_API_KEY?.slice(0, 4)}...${process.env.KITTEN_TTS_API_KEY?.slice(-4)}` : null,
      message: hasKey
        ? 'Kitten TTS API Key loaded from server environment. Cloud voice cloning and high-res models enabled.'
        : 'Running in offline local mode (0 API key required). Set KITTEN_TTS_API_KEY in environment to enable cloud clone syncing.',
    });
  });

  // API Route: Get available registered and cloud voices
  app.get('/api/kitten/voices', (_req, res) => {
    const clones = Array.from(registeredClones.values());
    res.json({
      standardVoices: ['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo'],
      customClones: clones,
    });
  });

  // API Route: Register/Upload custom voice clone recording
  app.post('/api/kitten/clone', (req, res) => {
    try {
      const { name, basePitchHz, timbre, description, durationSec, cloneId } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Voice persona name is required' });
        return;
      }

      const id = cloneId || `clone_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const record: ClonedVoiceRecord = {
        cloneId: id,
        name: String(name),
        gender: req.body.gender || 'Custom',
        basePitchHz: Number(basePitchHz) || 165,
        timbre: timbre || 'Custom Uploaded Timbre',
        description: description || 'User-uploaded voice persona recording.',
        sampleAudioDurationSec: Number(durationSec) || 3.0,
        createdAt: new Date().toISOString(),
      };

      registeredClones.set(id, record);
      res.json({
        success: true,
        clone: record,
        message: `Voice persona '${record.name}' successfully registered and ready for TTS synthesis.`,
      });
    } catch (err) {
      console.error('Error registering clone:', err);
      res.status(500).json({ error: 'Failed to process voice clone upload' });
    }
  });

  // API Route: Synthesize speech proxy (handles cloud API if key exists or custom clones)
  app.post('/api/kitten/synthesize', async (req, res) => {
    try {
      const { text, voice, model, speed = 1.0, pitch = 0, cloneId } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Text is required for synthesis' });
        return;
      }

      const apiKey = process.env.KITTEN_TTS_API_KEY;
      const isCloudConfigured = Boolean(apiKey && apiKey !== 'MY_KITTEN_TTS_API_KEY');

      // If user specified a cloneId, verify if registered
      const cloneRecord = cloneId ? registeredClones.get(cloneId) : null;

      // If real cloud API key is available, attempt upstream proxy
      if (isCloudConfigured) {
        try {
          const upstreamResponse = await fetch('https://api.kittentts.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              input: text,
              voice: cloneId || voice,
              model: model || 'kitten-nano-v0.8',
              speed,
            }),
          });

          if (upstreamResponse.ok) {
            const arrayBuffer = await upstreamResponse.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            res.json({
              source: 'kitten_cloud_api',
              wavBase64: `data:audio/wav;base64,${base64}`,
              duration: 2.0, // approximate or parse from header
              cloneId: cloneId || null,
            });
            return;
          }
        } catch (upstreamErr) {
          console.warn('Upstream Kitten TTS API unreachable, falling back to local DSP proxy:', upstreamErr);
        }
      }

      // Return proxy metadata allowing client-side DSP or cloned synthesis
      res.json({
        source: 'server_proxy_dsp',
        message: isCloudConfigured
          ? 'Synthesized via Kitten TTS proxy pipeline.'
          : 'Processed via Kitten on-device pipeline.',
        cloneRecord: cloneRecord || null,
        voice: cloneRecord ? cloneRecord.name : voice,
        speed,
        pitch,
      });
    } catch (err) {
      console.error('Synthesis proxy error:', err);
      res.status(500).json({ error: 'Speech synthesis request failed' });
    }
  });

  // Attach Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kitten-TTS Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
