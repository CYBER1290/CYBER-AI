import React, { useState } from 'react';
import { Settings, Check, HelpCircle, Save, Info, RefreshCw, KeyRound } from 'lucide-react';
import { Config } from '../types';

interface SettingsPanelProps {
  config: Config;
  onSaveConfig: (newConfig: Config) => Promise<void>;
  isSupabaseConnected: boolean;
}

const PERSONALITY_PRESETS = [
  {
    name: 'Stark Jarvis Assistant',
    description: 'Sleek, polite, articulate scifi AI companion. Refers to you as Sir or Boss.',
    prompt: 'smart futuristic Jarvis assistant, loyal, highly scientific, eloquent and slightly witty'
  },
  {
    name: 'Cyberpunk Renegade',
    description: 'Edgy, futuristic hacker ally. Talks in cool street slang and terminal tones.',
    prompt: 'renegade cyberpunk terminal AI hacker, witty, sarcastic, street-smart'
  },
  {
    name: 'Friendly Hinglish Dost',
    description: 'Casual Indian companion. Talks with mixed Hindi-English colloquial words.',
    prompt: 'friendly local helper, uses cozy Hinglish words, talks like a supportive tech-savy best friend'
  },
  {
    name: 'Zen Military Commander',
    description: 'Disciplined, tactical, focused. Gives direct, bulletproof, highly strategic outputs.',
    prompt: 'stoic military companion, tactical, brief, professional, focused on security and operations'
  }
];

export default function SettingsPanel({
  config,
  onSaveConfig,
  isSupabaseConnected
}: SettingsPanelProps) {
  const [appName, setAppName] = useState(config.app_name);
  const [language, setLanguage] = useState(config.language);
  const [personality, setPersonality] = useState(config.personality);
  const [voiceEnabled, setVoiceEnabled] = useState(config.voice_enabled);
  const [memoryEnabled, setMemoryEnabled] = useState(config.memory_enabled);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const applyPreset = (presetPrompt: string) => {
    setPersonality(presetPrompt);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await onSaveConfig({
        app_name: appName,
        language,
        theme: 'dark',
        voice_enabled: voiceEnabled,
        memory_enabled: memoryEnabled,
        personality
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col border border-cyan-500/20 bg-black/60 backdrop-blur-md rounded-xl p-5 shadow-lg shadow-cyan-500/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <div>
            <h2 className="font-bold tracking-widest text-cyan-300 font-mono text-sm">CYBER COGNITIVE CONTROLS</h2>
            <p className="text-[10px] text-cyan-500 font-mono">ADJUST JARVIS PARAMETERS AND NEURAL CHANNELS</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 font-mono text-xs text-cyan-400">
        {/* App Name */}
        <div className="space-y-1">
          <label className="block text-cyan-300 font-bold">ASSISTANT LOGICAL CODENAME:</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-950/80 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        {/* Language Selection */}
        <div className="space-y-1">
          <label className="block text-cyan-300 font-bold">VOCAL DIALECT MATRIX:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="w-full px-3 py-2 bg-zinc-950/80 border border-cyan-500/20 rounded-lg text-sm text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="hinglish">Hinglish (Hindi + English Mix)</option>
            <option value="english">Standard English (Jarvis Style)</option>
            <option value="hindi">Standard Hindi (हिंदी)</option>
          </select>
        </div>

        {/* Cognitive Toggles */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-2 bg-cyan-950/20 border border-cyan-500/10 p-2.5 rounded-lg cursor-pointer hover:bg-cyan-950/40 transition-colors select-none">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className="text-[11px] text-cyan-300">Voice Synthesis (TTS)</span>
          </label>

          <label className="flex items-center gap-2 bg-cyan-950/20 border border-cyan-500/10 p-2.5 rounded-lg cursor-pointer hover:bg-cyan-950/40 transition-colors select-none">
            <input
              type="checkbox"
              checked={memoryEnabled}
              onChange={(e) => setMemoryEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className="text-[11px] text-cyan-300">Neural Memory Vault</span>
          </label>
        </div>

        {/* Personality prompt */}
        <div className="space-y-1">
          <label className="block text-cyan-300 font-bold">CUSTOM PSYCHE SPECIFICATION (PROMPT):</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-zinc-950/80 border border-cyan-500/20 rounded-lg text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 font-sans leading-normal resize-none"
            placeholder="Define the core logic guidelines for CYBER AI..."
          />
        </div>

        {/* Personality Presets */}
        <div className="space-y-1.5">
          <label className="block text-cyan-400 font-bold text-[10px] tracking-wider">NEURAL COGNITIVE PRESETS:</label>
          <div className="grid grid-cols-2 gap-2">
            {PERSONALITY_PRESETS.map((preset) => {
              const isSelected = personality === preset.prompt;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.prompt)}
                  className={`p-2 rounded border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-zinc-950/40 border-cyan-500/10 hover:border-cyan-500/30 text-cyan-400/80'
                  }`}
                >
                  <div className="font-bold text-[10px] flex items-center justify-between">
                    <span>{preset.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-cyan-300" />}
                  </div>
                  <p className="text-[9px] text-cyan-400/60 leading-tight mt-0.5">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10">
          <div className="text-[10px] font-mono">
            {saveStatus === 'success' && <span className="text-emerald-400">✓ CHANNELS INTEGRATED SUCCESSFULLY</span>}
            {saveStatus === 'error' && <span className="text-rose-400">✗ TRANSMISSION ERROR</span>}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 hover:border-cyan-400 transition-all font-bold tracking-wider disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'INTEGRATING...' : 'APPLY CONFIG'}</span>
          </button>
        </div>
      </form>

      {/* Supabase Connection Helper Section */}
      <div className="mt-4 pt-3 border-t border-cyan-500/10 font-mono text-[10px] text-cyan-400/70">
        <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
          <KeyRound className="w-3.5 h-3.5 text-violet-400" />
          <span>SUPABASE CONNECTIVITY STATUS:</span>
        </div>
        {isSupabaseConnected ? (
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded p-2 text-emerald-400 leading-tight">
            <span>Secure Cloud database linked. Your conversations are backed up in real time to your private Supabase memory table.</span>
          </div>
        ) : (
          <div className="bg-amber-950/20 border border-amber-500/20 rounded p-2 text-amber-300/90 leading-normal">
            <span>Supabase credentials are unconfigured or in default mode. To backup memories to the cloud, configure your secrets in the <strong>Settings &gt; Secrets</strong> panel:</span>
            <div className="mt-1.5 space-y-0.5 text-cyan-300 bg-black/40 rounded p-1.5 text-[9px]">
              <div>• <code className="text-violet-400 font-bold">SUPABASE_URL</code> = https://your-proj.supabase.co</div>
              <div>• <code className="text-violet-400 font-bold">SUPABASE_ANON_KEY</code> = eyJhbGciOi...</div>
            </div>
            <div className="mt-1.5 text-[9px] text-cyan-400/60">
              Ensure you have a <code className="text-violet-400">memory</code> table with columns: <code className="text-zinc-300">id (int8)</code>, <code className="text-zinc-300">user_input (text)</code>, <code className="text-zinc-300">ai_response (text)</code>, <code className="text-zinc-300">created_at (timestamptz)</code>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
