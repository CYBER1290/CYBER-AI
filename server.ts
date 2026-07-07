import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateCyberReply } from './src/services/geminiService';
import { supabaseService } from './src/services/supabaseService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side path for config.json to persist edits
const configFilePath = path.join(process.cwd(), 'src', 'config', 'config.json');

// --- API ROUTES ---

// 1. App configuration API
app.get('/api/config', (req, res) => {
  try {
    if (fs.existsSync(configFilePath)) {
      const configData = fs.readFileSync(configFilePath, 'utf8');
      res.json(JSON.parse(configData));
    } else {
      // Default fallback
      res.json({
        app_name: 'CYBER AI',
        language: 'hinglish',
        theme: 'dark',
        voice_enabled: true,
        memory_enabled: true,
        personality: 'smart futuristic Jarvis assistant'
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read server configuration: ' + err.message });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    
    // Validate config structure
    if (!newConfig.app_name || !newConfig.personality || !newConfig.language) {
      return res.status(400).json({ error: 'Invalid configuration parameters.' });
    }

    // Save to file to persist settings
    fs.writeFileSync(configFilePath, JSON.stringify(newConfig, null, 2), 'utf8');
    res.json({ status: 'success', config: newConfig });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save server configuration: ' + err.message });
  }
});

// 2. Chat completion API using server-side Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, personality, language, memory_enabled } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message input is required.' });
    }

    const reply = await generateCyberReply(
      message,
      history || [],
      personality,
      language,
      memory_enabled !== false
    );

    res.json({ reply });
  } catch (err: any) {
    console.error('❌ Error processing chat reply:', err);
    res.status(500).json({ error: 'Server chat processing failure: ' + err.message });
  }
});

// 3. Memory storage & management API (proxying Supabase safely)
app.get('/api/memory', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const memories = await supabaseService.getMemories(limit);
    res.json({
      memories,
      isSupabaseConnected: supabaseService.getIsConfigured()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch memories: ' + err.message });
  }
});

app.post('/api/memory', async (req, res) => {
  try {
    const { userInput, aiResponse } = req.body;
    if (!userInput || !aiResponse) {
      return res.status(400).json({ error: 'Missing userInput or aiResponse parameters.' });
    }

    const saved = await supabaseService.saveMemory(userInput, aiResponse);
    res.json({ status: 'success', memory: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save memory record: ' + err.message });
  }
});

app.delete('/api/memory', async (req, res) => {
  try {
    const cleared = await supabaseService.clearMemories();
    res.json({ status: 'success', cleared });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear memories: ' + err.message });
  }
});

// --- CLIENT SERVING ---

async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite HMR disabled
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('🤖 Development server running with Vite middleware.');
  } else {
    // Production mode serving built assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('🚀 Production server serving pre-built bundle from /dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 CYBER AI Server online and listening at http://localhost:${PORT}`);
  });
}

initializeServer().catch((error) => {
  console.error('❌ Failed to initialize CYBER AI full-stack server:', error);
});
