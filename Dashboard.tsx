import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  Database, 
  Settings, 
  HelpCircle, 
  AlertTriangle, 
  Mic, 
  MicOff,
  Cpu,
  RefreshCw,
  PhoneCall,
  VolumeX,
  Volume2
} from 'lucide-react';
import { Config, Message, Memory } from '../types';
import ChatWindow from '../components/ChatWindow';
import StatusMatrix from '../components/StatusMatrix';
import VoiceStatus from '../components/VoiceStatus';
import MemoryViewer from '../components/MemoryViewer';
import SettingsPanel from '../components/SettingsPanel';
import { SpeechToTextEngine, isSpeechRecognitionSupported, ttsEngine } from '../utils/speech';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'settings' | 'instructions'>('chat');
  const [config, setConfig] = useState<Config>({
    app_name: 'CYBER AI',
    language: 'hinglish',
    theme: 'dark',
    voice_enabled: true,
    memory_enabled: true,
    personality: 'smart futuristic Jarvis assistant'
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // References to keep callbacks current for speech engines
  const configRef = useRef(config);
  const isSpeakingRef = useRef(isSpeaking);
  const isThinkingRef = useRef(isThinking);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Load configuration and memories on startup
  useEffect(() => {
    fetchConfig();
    fetchMemories();
    
    // Add cool system welcome message on startup
    const welcomeText = "Neural core online. Vocal bridges fully synchronized. Welcome back, Commander. I am CYBER AI, your personal Jarvis-style assistant. You can speak or type custom instructions, and I will remember our discussions. What protocol shall we execute?";
    setMessages([
      {
        id: 'welcome-0',
        sender: 'cyber',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      }
    ]);
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memory?limit=30');
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        setIsSupabaseConnected(data.isSupabaseConnected || false);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    }
  };

  const handleSaveConfig = async (newConfig: Config) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(newConfig);
        // If voice gets disabled, stop any ongoing synth
        if (!newConfig.voice_enabled) {
          ttsEngine.stop();
          setIsSpeaking(false);
        }
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      console.error('Failed to save config:', err);
      throw err;
    }
  };

  const handleClearMemories = async () => {
    try {
      const res = await fetch('/api/memory', {
        method: 'DELETE'
      });
      if (res.ok) {
        setMemories([]);
        // Stop any active speech explaining past details
        ttsEngine.stop();
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('Failed to clear memories:', err);
    }
  };

  // Logic to process sending a new message
  const handleSendMessage = async (text: string, isVoiceInput = false) => {
    if (!text.trim() || isThinking) return;

    // Stop current speech output when user issues a new prompt (bypasses overlap)
    ttsEngine.stop();
    setIsSpeaking(false);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      isVoiceInput
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setErrorMsg(null);

    // Compile history for Gemini (excluding the current prompt since we pass it separately)
    // Keep last 8 messages for context window stability
    const contextHistory = messages
      .slice(-8)
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text
      }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: contextHistory,
          personality: configRef.current.personality,
          language: configRef.current.language,
          memory_enabled: configRef.current.memory_enabled
        })
      });

      if (!res.ok) {
        throw new Error('Connection bottleneck detected. Please re-route.');
      }

      const data = await res.json();
      const aiReply = data.reply || 'Data line quiet. Re-establishing link.';

      const cyberMessage: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'cyber',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      };

      setMessages((prev) => [...prev, cyberMessage]);
      setIsThinking(false);

      // Speak out loud if voice is enabled
      if (configRef.current.voice_enabled) {
        setIsSpeaking(true);
        ttsEngine.speak(aiReply, configRef.current.language, () => {
          setIsSpeaking(false);
        });
      }

      // Sync memories dynamically
      if (configRef.current.memory_enabled) {
        fetchMemories();
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Transmission disrupted.');
      setIsThinking(false);

      const systemErrorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        sender: 'cyber',
        text: "ALERT: Neural linkage failed. I cannot transmit your response to the central brain at this time.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      setMessages((prev) => [...prev, systemErrorMessage]);
    }
  };

  // Initialize Speech to Text Engine
  const sttEngine = useMemo(() => {
    return new SpeechToTextEngine(
      (transcript) => {
        // Handle Transcript callback
        if (transcript.trim()) {
          handleSendMessage(transcript, true);
        }
      },
      (listening) => {
        // Listening state changed
        setIsListening(listening);
        if (listening) {
          // Interrupt any active speech if user starts talking
          ttsEngine.stop();
          setIsSpeaking(false);
        }
      },
      (error) => {
        // Error callback
        console.warn('Speech engine report:', error);
      }
    );
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      sttEngine.stop();
    } else {
      sttEngine.start(config.language);
    }
  };

  const speechSupported = isSpeechRecognitionSupported();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950">
      
      {/* Background neon grids and visual matrix overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,240,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      
      {/* Sleek Header */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-400/50 flex items-center justify-center text-cyan-400 font-bold tracking-widest text-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
              CΩ
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950" title="Core Engine Live"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-widest bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {config.app_name}
            </h1>
            <p className="text-[10px] font-mono text-cyan-500/80 uppercase tracking-widest">
              PERSONAL COGNITIVE ASSISTANT GRID
            </p>
          </div>
        </div>

        {/* Global Control Stats / Status Toggles */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1 bg-cyan-950/10 border border-cyan-500/10 rounded-full font-mono text-[10px] text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PERSISTENT SYNC: {isSupabaseConnected ? 'SUPABASE ACTIVE' : 'LOCAL ENGINE'}</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 border border-cyan-500/15 rounded-lg font-mono text-xs">
            <button
              onClick={() => {
                const updated = { ...config, voice_enabled: !config.voice_enabled };
                handleSaveConfig(updated);
              }}
              className={`p-1.5 rounded transition-all ${config.voice_enabled ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              title={config.voice_enabled ? 'Mute Speech Synthesis' : 'Enable Speech Synthesis'}
            >
              {config.voice_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left column (Arc Reactor, Diagnostic matrix, System tools) */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          {/* Reactor Unit */}
          <div className="border border-cyan-500/20 bg-black/40 backdrop-blur-md rounded-xl p-4 flex flex-col items-center justify-center relative shadow-lg shadow-cyan-500/5">
            <div className="absolute top-2 left-3 font-mono text-[9px] text-cyan-500">SECTOR #01 - AI CORE</div>
            <VoiceStatus 
              isListening={isListening} 
              isSpeaking={isSpeaking} 
              isThinking={isThinking} 
              onClickMic={toggleListening}
              isSpeechSupported={speechSupported}
            />
            {speechSupported && (
              <button
                onClick={toggleListening}
                className={`mt-2 flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-xs font-bold tracking-widest transition-all ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                    : 'bg-cyan-950 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'DISCONNECT VOCAL' : 'INITIALIZE VOCAL LINK'}</span>
              </button>
            )}
          </div>

          {/* Telemetry diagnostics */}
          <StatusMatrix 
            config={config} 
            isSupabaseConnected={isSupabaseConnected} 
            memoriesCount={memories.length} 
            isSpeechSupported={speechSupported}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onRefresh={() => {
              fetchConfig();
              fetchMemories();
            }}
          />

          {/* Rapid spec helper block */}
          <div className="border border-cyan-500/10 bg-zinc-950/30 rounded-xl p-4 font-mono text-[11px] text-cyan-500/80 leading-relaxed">
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>UPGRADE PROTOCOLS READY</span>
            </div>
            <span>
              CYBER AI's modular stack is designed for seamless extension. The server pipelines support integration with Google Calendar, Sheets, Web Search Grounding, PDF Analysis, and future compilation into Android via native web view bindings.
            </span>
          </div>
        </div>

        {/* Right column (Tabs workspace for Terminal, Memories, Settings, Docs) */}
        <div className="lg:col-span-8 flex flex-col gap-4 order-1 lg:order-2">
          
          {/* Custom Tabs Navigation */}
          <div className="flex border-b border-cyan-500/15 bg-black/40 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-mono text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">TERMINAL STREAM</span>
            </button>
            
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-mono text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'memory'
                  ? 'bg-violet-500/10 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">MEMORY VAULT</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-mono text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">COGNITIVE SYSTEM</span>
            </button>

            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-2.5 px-3 rounded-lg font-mono text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'instructions'
                  ? 'bg-violet-500/10 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-zinc-900/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">DOCUMENTATION</span>
            </button>
          </div>

          {/* Workspaces */}
          <div className="flex-1 min-h-[400px]">
            {activeTab === 'chat' && (
              <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                isThinking={isThinking}
                appName={config.app_name}
              />
            )}

            {activeTab === 'memory' && (
              <MemoryViewer
                memories={memories}
                onClearMemories={handleClearMemories}
                isSupabaseConnected={isSupabaseConnected}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel
                config={config}
                onSaveConfig={handleSaveConfig}
                isSupabaseConnected={isSupabaseConnected}
              />
            )}

            {activeTab === 'instructions' && (
              <div className="border border-violet-500/20 bg-black/60 backdrop-blur-md rounded-xl p-5 shadow-lg shadow-violet-500/5 font-mono text-xs text-violet-300 leading-relaxed space-y-4 max-h-[520px] overflow-y-auto custom-scrollbar">
                <div className="border-b border-violet-500/20 pb-2.5">
                  <h2 className="font-bold tracking-widest text-sm text-violet-200 flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-violet-400" />
                    <span>CYBER AI IMPLEMENTATION SPECS</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-violet-200 uppercase">1. HOW TO SETUP SUPABASE DATABASE:</h3>
                    <p className="text-zinc-300">
                      CYBER AI is configured with a secure backend Supabase sync proxy. To configure:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                      <li>Create a free account on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com</a>.</li>
                      <li>Create a new project. Navigate to the SQL Editor and run:
                        <pre className="bg-black/80 text-cyan-400 p-2 rounded mt-1 font-mono text-[10px] border border-cyan-500/20 overflow-x-auto">
{`CREATE TABLE memory (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_input text NOT NULL,
  ai_response text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
                        </pre>
                      </li>
                      <li>Go to <strong>Project Settings &gt; API</strong> and grab your <strong>Project URL</strong> and <strong>anon public API key</strong>.</li>
                      <li>Add them to your secrets in Google AI Studio Settings Panel as <code className="text-violet-400 font-bold">SUPABASE_URL</code> and <code className="text-violet-400 font-bold">SUPABASE_ANON_KEY</code>.</li>
                    </ol>
                  </div>

                  <div className="space-y-1 pt-2">
                    <h3 className="font-bold text-violet-200 uppercase">2. GEMINI API CONNECTION:</h3>
                    <p className="text-zinc-300">
                      The Gemini API works automatically! At runtime, Google AI Studio injects your Gemini credentials directly from your safe workspace secrets via the server-only <code className="text-violet-400 font-bold">process.env.GEMINI_API_KEY</code> variable, keeping it 100% secure from the browser environment.
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <h3 className="font-bold text-violet-200 uppercase">3. VOCAL STT & TTS SUPPORT:</h3>
                    <p className="text-zinc-300">
                      Vocal bridging utilizes direct browser standard hardware:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                      <li><strong>Speech-To-Text:</strong> Powered by HTML5 speech recognition, using Indian English or Hindi language parsing for seamless bilingual Hinglish.</li>
                      <li><strong>Text-To-Speech:</strong> Uses local web speech synthesis with automated accent selection matching your chosen language.</li>
                    </ul>
                  </div>

                  <div className="space-y-1 pt-2">
                    <h3 className="font-bold text-violet-200 uppercase">4. FUTURE ANDROID APP CONVERSION:</h3>
                    <p className="text-zinc-300">
                      Because CYBER AI is modular and responsive, you can convert it into an Android app in under 15 minutes:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-[11px]">
                      <li>Create a Kotlin Android project inside Android Studio.</li>
                      <li>Set up a full-screen <code className="text-violet-400">WebView</code>.</li>
                      <li>Enable DOM Storage and JavaScript:
                        <pre className="bg-black/80 text-cyan-400 p-2 rounded mt-1 font-mono text-[9px] border border-cyan-500/20">
{`webView.settings.javaScriptEnabled = true
webView.settings.domStorageEnabled = true
webView.settings.mediaPlaybackRequiresUserGesture = false`}
                        </pre>
                      </li>
                      <li>Load your deployed CYBER AI application URL: <code className="text-cyan-400">webView.loadUrl("https://your-cyber-ai-app.run.app")</code>.</li>
                      <li>Grant Android permission for microphone in <code className="text-violet-400 font-bold">AndroidManifest.xml</code> to enable hands-free voice link commands.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Floating System Warning Banner if any error */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-950 border border-rose-500 text-rose-300 px-4 py-3 rounded-lg text-xs font-mono flex items-center gap-3 shadow-lg shadow-black">
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <span className="font-bold">SYSTEM TELEMETRY CRITICAL</span>
            <p className="text-[10px] text-rose-400/80">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
