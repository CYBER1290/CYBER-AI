import React, { useEffect, useState } from 'react';
import { Cpu, Database, Volume2, Shield, Activity, RefreshCw } from 'lucide-react';
import { Config, Memory } from '../types';

interface StatusMatrixProps {
  config: Config;
  isSupabaseConnected: boolean;
  memoriesCount: number;
  isSpeechSupported: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onRefresh: () => void;
}

export default function StatusMatrix({
  config,
  isSupabaseConnected,
  memoriesCount,
  isSpeechSupported,
  isListening,
  isSpeaking,
  onRefresh
}: StatusMatrixProps) {
  const [systemPing, setSystemPing] = useState<number>(14);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    // Cyberpunk dynamic clock
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Randomize system ping to simulate actual dynamic telemetry
    const pingTimer = setInterval(() => {
      setSystemPing(Math.floor(Math.random() * 20) + 10);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(pingTimer);
    };
  }, []);

  return (
    <div className="border border-cyan-500/30 bg-black/60 backdrop-blur-md rounded-xl p-4 font-mono text-xs text-cyan-400 shadow-lg shadow-cyan-500/5">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-widest text-cyan-300">CYBER LINK TELEMETRY</span>
        </div>
        <button 
          onClick={onRefresh}
          className="p-1 text-cyan-500 hover:text-cyan-300 transition-colors"
          title="Refresh Diagnostics"
        >
          <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-500/10 rounded px-2 py-1.5">
          <span className="text-cyan-500 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" /> SYSTEM ENGINE:
          </span>
          <span className="text-cyan-300 font-bold">ONLINE</span>
        </div>

        <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-500/10 rounded px-2 py-1.5">
          <span className="text-cyan-500 flex items-center gap-1">
            <Database className="w-3 h-3 text-violet-400" /> MEMORY VAULT:
          </span>
          <span className={`${isSupabaseConnected ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>
            {isSupabaseConnected ? 'SUPABASE' : 'LOCAL'} ({memoriesCount})
          </span>
        </div>

        <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-500/10 rounded px-2 py-1.5">
          <span className="text-cyan-500 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-emerald-400" /> VOCAL BRIDGE:
          </span>
          <span className={`${isSpeechSupported ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
            {isSpeechSupported ? 'READY' : 'UNSUPPORTED'}
          </span>
        </div>

        <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-500/10 rounded px-2 py-1.5">
          <span className="text-cyan-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-400" /> PERSISTENCE:
          </span>
          <span className="text-violet-300 font-bold capitalize">{config.language}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[10px] text-cyan-500">
        <div>COEFFICIENT: <span className="text-cyan-300">{(systemPing / 1000).toFixed(3)}s</span></div>
        <div>TIME: <span className="text-cyan-300">{timeStr}</span></div>
        <div className="flex items-center gap-1">
          STATUS: 
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Dynamic Voice state readout */}
      {(isListening || isSpeaking) && (
        <div className="mt-2 text-center text-[10px] border border-cyan-500/20 bg-cyan-950/30 rounded py-1 animate-pulse">
          {isListening && <span className="text-red-400 tracking-wider">▲ ACTIVE LISTEN CHANNEL ROUTED</span>}
          {isSpeaking && <span className="text-emerald-400 tracking-wider">▼ AUDIO SYNTH TRANSLATION OUTPUT ACTIVE</span>}
        </div>
      )}
    </div>
  );
}
