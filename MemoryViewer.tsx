import React, { useState } from 'react';
import { Database, Search, Trash2, ShieldCheck, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { Memory } from '../types';

interface MemoryViewerProps {
  memories: Memory[];
  onClearMemories: () => Promise<void>;
  isSupabaseConnected: boolean;
}

export default function MemoryViewer({
  memories,
  onClearMemories,
  isSupabaseConnected
}: MemoryViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const filteredMemories = memories.filter(
    (m) =>
      m.user_input.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ai_response.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear CYBER AI\'s persistent neural memory? This action cannot be undone.')) {
      setIsClearing(true);
      await onClearMemories();
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-violet-500/20 bg-black/60 backdrop-blur-md rounded-xl p-5 shadow-lg shadow-violet-500/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-500/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-violet-400 animate-pulse" />
          <div>
            <h2 className="font-bold tracking-widest text-violet-300 font-mono text-sm">NEURAL MEMORY VAULT</h2>
            <p className="text-[10px] text-violet-400 font-mono">
              {isSupabaseConnected ? 'SUPABASE CLOUD GRID SYNCED' : 'LOCAL CACHE EMULATOR'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClear}
          disabled={isClearing || memories.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 font-mono text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isClearing ? 'CLEARING...' : 'PURGE LOGS'}</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-violet-950/15 border border-violet-500/10 rounded-lg p-3 mb-4 text-xs font-mono text-violet-300 leading-relaxed flex gap-3">
        <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <div>
          <span>
            CYBER AI remembers details from previous chats to enhance continuity. These interactions are stored
            chronologically. If you mention something discussed earlier, the neural context is automatically injected into the latest request.
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-violet-500" />
        <input
          type="text"
          placeholder="Filter core memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-zinc-950/80 border border-violet-500/20 rounded-lg text-sm text-violet-200 placeholder-violet-500/60 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30 font-mono"
        />
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 space-y-3 custom-scrollbar">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-10 font-mono text-xs text-violet-400/60">
            {searchQuery ? 'No filtered recollections found.' : 'Core memory registers empty.'}
          </div>
        ) : (
          filteredMemories.map((mem, i) => (
            <div
              key={mem.id || i}
              className="bg-zinc-950/50 border border-violet-500/10 rounded-lg p-3 hover:border-violet-500/30 transition-all group"
            >
              <div className="flex justify-between items-center text-[10px] text-violet-400/80 font-mono border-b border-violet-500/5 pb-1.5 mb-2">
                <span className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3 h-3 text-violet-500" />
                  SECTOR #{mem.id ? String(mem.id).slice(-4) : i + 1000}
                </span>
                <span>{mem.created_at ? new Date(mem.created_at).toLocaleDateString() : 'REAL-TIME'}</span>
              </div>
              
              <div className="space-y-1.5">
                <div className="text-xs">
                  <span className="font-bold text-violet-400 font-mono mr-1">INPUT:</span>
                  <span className="text-zinc-200">{mem.user_input}</span>
                </div>
                <div className="text-xs bg-violet-950/10 border-l border-violet-500/20 pl-2 py-1">
                  <span className="font-bold text-emerald-400 font-mono mr-1">REPLY:</span>
                  <span className="text-zinc-300">{mem.ai_response}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
