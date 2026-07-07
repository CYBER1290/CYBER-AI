import React from 'react';
import { motion } from 'motion/react';
import { Mic, Volume2, Sparkles, Radio } from 'lucide-react';

interface VoiceStatusProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onClickMic: () => void;
  isSpeechSupported: boolean;
}

export default function VoiceStatus({
  isListening,
  isSpeaking,
  isThinking,
  onClickMic,
  isSpeechSupported
}: VoiceStatusProps) {
  // Let's render a gorgeous futuristic Jarvis core (arc reactor style)
  // which dynamically reacts to state transitions

  return (
    <div className="flex flex-col items-center justify-center p-6 relative">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Pulsing Ambient Background Glow */}
        <motion.div
          animate={{
            scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.1, 1] : [1, 1.03, 1],
            opacity: isListening ? [0.3, 0.6, 0.3] : isThinking ? [0.4, 0.7, 0.4] : 0.2,
          }}
          transition={{
            duration: isListening ? 1.5 : isThinking ? 2 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-500 ${
            isListening 
              ? 'bg-rose-500/40' 
              : isThinking 
                ? 'bg-violet-500/40' 
                : isSpeaking 
                  ? 'bg-emerald-500/40' 
                  : 'bg-cyan-500/20'
          }`}
        />

        {/* Outer Tech Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: isListening ? 8 : isThinking ? 3 : 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`absolute inset-0 rounded-full border border-dashed transition-colors duration-500 ${
            isListening 
              ? 'border-rose-500/40' 
              : isThinking 
                ? 'border-violet-500/40' 
                : isSpeaking 
                  ? 'border-emerald-500/40' 
                  : 'border-cyan-500/30'
          }`}
        />

        {/* Middle Orbit Ring (with gaps) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: isListening ? 5 : isThinking ? 2 : 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`absolute inset-4 rounded-full border-2 border-double transition-colors duration-500 ${
            isListening 
              ? 'border-rose-400/30 border-t-rose-500 border-b-rose-500' 
              : isThinking 
                ? 'border-violet-400/30 border-t-violet-500 border-b-violet-500' 
                : isSpeaking 
                  ? 'border-emerald-400/30 border-t-emerald-500 border-b-emerald-500' 
                  : 'border-cyan-400/20 border-t-cyan-500 border-b-cyan-500'
          }`}
        />

        {/* Core Pulsing Reactor Disc */}
        <motion.div
          animate={{
            scale: isListening ? [0.95, 1.05, 0.95] : [1, 1.02, 1],
            boxShadow: isListening 
              ? '0 0 30px rgba(244, 63, 94, 0.5)' 
              : isThinking 
                ? '0 0 30px rgba(139, 92, 246, 0.5)'
                : isSpeaking 
                  ? '0 0 30px rgba(16, 185, 129, 0.5)'
                  : '0 0 20px rgba(6, 182, 212, 0.2)'
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          onClick={onClickMic}
          className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-500 z-10 select-none ${
            isListening 
              ? 'bg-rose-950/70 border-2 border-rose-500 text-rose-400' 
              : isThinking 
                ? 'bg-violet-950/70 border-2 border-violet-500 text-violet-400' 
                : isSpeaking 
                  ? 'bg-emerald-950/70 border-2 border-emerald-500 text-emerald-400' 
                  : 'bg-cyan-950/70 border-2 border-cyan-500/80 text-cyan-400'
          }`}
        >
          {isListening ? (
            <>
              <Radio className="w-8 h-8 animate-pulse text-rose-400" />
              <span className="text-[10px] mt-1 font-bold font-mono tracking-widest text-rose-400">LISTENING</span>
            </>
          ) : isThinking ? (
            <>
              <Sparkles className="w-8 h-8 animate-spin text-violet-400" style={{ animationDuration: '3s' }} />
              <span className="text-[10px] mt-1 font-bold font-mono tracking-widest text-violet-300">THINKING</span>
            </>
          ) : isSpeaking ? (
            <>
              <Volume2 className="w-8 h-8 text-emerald-400" />
              <span className="text-[10px] mt-1 font-bold font-mono tracking-widest text-emerald-400">SPEAKING</span>
            </>
          ) : (
            <>
              <Mic className="w-8 h-8 text-cyan-400 hover:scale-110 transition-transform duration-300" />
              <span className="text-[10px] mt-1 font-bold font-mono tracking-widest text-cyan-400/80 hover:text-cyan-300 transition-colors">TAP ENGINE</span>
            </>
          )}
        </motion.div>
        
        {/* Futuristic Grid Overlays */}
        <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden opacity-10">
          <div className="w-full h-full bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:12px_12px]" />
        </div>
      </div>

      {/* Futuristic Voice Wave bars that jump up and down while speaking or listening */}
      <div className="flex items-center gap-1.5 mt-5 h-8 w-44 justify-center">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isListening 
                ? [8, Math.floor(Math.random() * 24) + 8, 8] 
                : isSpeaking 
                  ? [8, Math.floor(Math.random() * 20) + 12, 8] 
                  : 6
            }}
            transition={{
              duration: 0.35 + (i * 0.05),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`w-1 rounded-full transition-colors duration-500 ${
              isListening 
                ? 'bg-rose-500' 
                : isSpeaking 
                  ? 'bg-emerald-500' 
                  : 'bg-cyan-500/20'
            }`}
          />
        ))}
      </div>

      {!isSpeechSupported && (
        <span className="text-[10px] mt-2 font-mono text-amber-500 bg-amber-950/30 border border-amber-500/20 rounded px-2 py-0.5 animate-pulse text-center">
          Note: Local Speech Recognition restricted by browser permissions.
        </span>
      )}
    </div>
  );
}
