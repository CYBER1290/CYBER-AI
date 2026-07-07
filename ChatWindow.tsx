import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, BrainCircuit, Terminal, ArrowUpCircle } from 'lucide-react';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isThinking: boolean;
  appName: string;
}

const QUICK_QUERIES = [
  { label: 'Who are you?', value: 'Introduce yourself and state your active protocol specification.' },
  { label: 'Speak Hinglish', value: 'Abse mere saath Hinglish me baat karo. Tell me some cool cyber tips.' },
  { label: 'Hindi Mode', value: 'हिंदी भाषा एक्टिवेट करें। अपना परिचय दें।' },
  { label: 'Jarvis Specs', value: 'Identify your system clusters, active database memory vault, and logical design parameters.' }
];

export default function ChatWindow({
  messages,
  onSendMessage,
  isThinking,
  appName
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickQuery = (queryValue: string) => {
    if (isThinking) return;
    onSendMessage(queryValue);
  };

  return (
    <div className="flex flex-col h-[520px] border border-cyan-500/20 bg-black/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg shadow-cyan-500/5">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between bg-zinc-950 px-4 py-2 border-b border-cyan-500/10 font-mono text-[10px] text-cyan-400">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider">{appName.toUpperCase()} CORE TERMINAL</span>
        </div>
        <div className="flex items-center gap-2">
          <span>SECURE LINK v2.5</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar bg-black/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center font-mono text-xs">
            <BrainCircuit className="w-12 h-12 text-cyan-500/40 animate-pulse mb-3" />
            <span className="text-cyan-400 font-bold tracking-widest text-sm mb-1">CYBER AI ASSISTANT ONLINE</span>
            <p className="text-cyan-500/60 max-w-sm mb-6">
              Establish a voice or textual link. Use the quick cognitive directives below or input custom prompts.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {QUICK_QUERIES.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handleQuickQuery(q.value)}
                  className="px-3 py-2 text-left rounded-lg bg-zinc-950 border border-cyan-500/10 hover:border-cyan-500/40 text-[11px] text-cyan-400 hover:text-cyan-300 transition-all font-mono"
                >
                  <span className="font-semibold block mb-0.5 text-cyan-300">{q.label}</span>
                  <span className="text-[10px] text-cyan-500/70 truncate block">{q.value}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isCyber = msg.sender === 'cyber';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isCyber ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                    isCyber
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400'
                      : 'bg-violet-950/80 border-violet-500 text-violet-400'
                  }`}
                >
                  {isCyber ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Balloon */}
                <div className="space-y-1">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed border ${
                      isCyber
                        ? 'bg-zinc-950/90 border-cyan-500/20 text-cyan-100 rounded-tl-none'
                        : 'bg-zinc-900/95 border-violet-500/20 text-violet-100 rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  {/* Timestamp & Tag info */}
                  <div
                    className={`flex items-center gap-1.5 text-[9px] font-mono opacity-60 ${
                      isCyber ? 'text-cyan-500 pl-1' : 'text-violet-500 justify-end pr-1'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.isVoiceInput && (
                      <span className="text-[8px] bg-violet-950/40 border border-violet-500/20 px-1 rounded">
                        via Voice-Link
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-cyan-950/80 border-cyan-500 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }}>
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-cyan-950/30 border border-cyan-500/10 text-cyan-400 text-xs font-mono tracking-widest flex items-center gap-2 animate-pulse">
              <span>SYNCHRONIZING NEURAL NODE</span>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Directives Bar (sticky at bottom of chat flow when active) */}
      {messages.length > 0 && (
        <div className="bg-zinc-950/70 border-t border-cyan-500/5 px-4 py-1.5 overflow-x-auto whitespace-nowrap flex gap-2 items-center custom-scrollbar">
          <span className="text-[9px] font-mono text-cyan-500 tracking-wider mr-1 shrink-0">DIRECTIVES:</span>
          {QUICK_QUERIES.map((q) => (
            <button
              key={q.label}
              disabled={isThinking}
              onClick={() => handleQuickQuery(q.value)}
              className="px-2.5 py-1 rounded-full bg-zinc-900 border border-cyan-500/10 text-[10px] text-cyan-400 hover:border-cyan-400 hover:bg-cyan-950/30 transition-all font-mono inline-block disabled:opacity-40"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat Form Entry */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-cyan-500/10 bg-zinc-950">
        <div className="relative flex items-center bg-black/50 border border-cyan-500/20 rounded-xl overflow-hidden focus-within:border-cyan-400 transition-all pr-2">
          <input
            type="text"
            placeholder="Relay prompt to CYBER AI assistant..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            className="flex-1 px-4 py-3 bg-transparent text-sm text-cyan-100 placeholder-cyan-500/50 focus:outline-none disabled:opacity-50 font-mono"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 rounded-lg bg-cyan-950/60 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/60 border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Transmit prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
