import React, { useEffect, useState, useRef } from 'react';
import { Mic, Volume2, CheckCircle2, Sparkles, X, Lightbulb, Thermometer, Lock, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceState, VoiceCommandResult } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  state: VoiceState;
  onClose: () => void;
  onExecuteCommand: (command: string) => void;
  lastResult: VoiceCommandResult | null;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  state,
  onClose,
  onExecuteCommand,
  lastResult
}) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [simulatedAudioLevels, setSimulatedAudioLevels] = useState<number[]>([40, 65, 90, 45, 80, 55, 70, 95, 60, 40]);

  // Voice recognition setup
  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      return;
    }

    // Audio level oscillation animation
    const interval = setInterval(() => {
      setSimulatedAudioLevels(prev =>
        prev.map(() => Math.floor(20 + Math.random() * 80))
      );
    }, 120);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            onExecuteCommand(text);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
        };

        recognition.onend = () => {
          // Handled
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init error:', err);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, [isOpen, onExecuteCommand]);

  const quickPrompts = [
    { label: 'Turn on all lights', icon: Lightbulb, command: 'Turn on all lights in living room' },
    { label: 'Set temp to 71°F', icon: Thermometer, command: 'Set temperature to 71 degrees' },
    { label: 'Lock studio door', icon: Lock, command: 'Lock the creative studio biometric deadbolt' },
    { label: 'Movie mode', icon: Film, command: 'Engage cinema movie mode' },
    { label: 'Goodnight scene', icon: Sparkles, command: 'Goodnight, shut down all devices' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="voice-assistant-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-[24px] bg-[#111217] border border-white/15 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12)'
          }}
        >
          {/* Top glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/15 blur-[60px] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close voice dialogue"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0a0a0c] shadow-md shadow-white/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono-code text-[11px] uppercase tracking-widest text-white/70 font-bold">
                EDEN AI VOICE CORE
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Listening for Smart Home Directives
              </h2>
            </div>
          </div>

          {/* Live Audio Waveform Graphic */}
          <div className="h-20 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 px-4 mb-5">
            {simulatedAudioLevels.map((lvl, i) => (
              <motion.div
                key={i}
                animate={{ height: `${Math.max(14, lvl)}%` }}
                transition={{ duration: 0.12 }}
                className="w-2 rounded-full bg-gradient-to-t from-[#4f5564] to-[#ffffff]"
              />
            ))}
          </div>

          {/* Real-time transcription */}
          <div className="min-h-[54px] rounded-xl bg-white/5 border border-white/10 p-3.5 mb-5 flex items-center justify-between">
            <div className="text-sm font-mono-code text-white">
              {transcript ? (
                <span className="text-white">"{transcript}"</span>
              ) : (
                <span className="text-white/40 italic">Speak naturally (e.g. "Dim the living room", "Set thermostat to 72")...</span>
              )}
            </div>
            <Volume2 className="w-4 h-4 text-white/80 animate-pulse ml-2 flex-shrink-0" />
          </div>

          {/* Last Result feedback if available */}
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-5 rounded-xl bg-white/10 border border-white/30 flex items-center gap-2.5 text-xs font-mono-code text-white"
            >
              <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
              <span>{lastResult.actionTaken}</span>
            </motion.div>
          )}

          {/* Instant Preset Voice Chips */}
          <div>
            <div className="text-[11px] font-mono-code uppercase tracking-wider text-white/50 mb-2.5">
              Quick Voice Test Chips
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(item.command);
                    onExecuteCommand(item.command);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/40 text-xs text-white/90 transition-all active:scale-95 cursor-pointer"
                >
                  <item.icon className="w-3.5 h-3.5 text-white/80" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

