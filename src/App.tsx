import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HeroScreen } from './components/HeroScreen';
import { RoomShelfScreen } from './components/RoomShelfScreen';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { INITIAL_ROOMS, parseVoiceCommand } from './data/homeData';
import { Room, VoiceState, VoiceCommandResult } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'hero' | 'shelf'>('hero');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [lastVoiceResult, setLastVoiceResult] = useState<VoiceCommandResult | null>(null);
  const [lastCommandNotice, setLastCommandNotice] = useState<string | null>(null);

  // Play subtle feedback chime using Web Audio API
  const playFeedbackTone = useCallback((frequency = 440, type: OscillatorType = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  }, []);

  // Shared "Enter Nimbus" action for all 3 triggers
  const handleEnterNimbus = useCallback(() => {
    playFeedbackTone(520);
    setCurrentView('shelf');
  }, [playFeedbackTone]);

  // Back to Hero
  const handleBackToHero = useCallback(() => {
    playFeedbackTone(380);
    setCurrentView('hero');
  }, [playFeedbackTone]);

  // Arm Mic via Drag or Click
  const handleArmMic = useCallback(() => {
    playFeedbackTone(660);
    setVoiceState('listening');
    setIsVoiceModalOpen(true);
  }, [playFeedbackTone]);

  // Execute Voice Command
  const handleExecuteCommand = useCallback((transcript: string) => {
    setVoiceState('processing');
    playFeedbackTone(880);

    const { updatedRooms, result } = parseVoiceCommand(transcript, rooms);
    setRooms(updatedRooms);
    setLastVoiceResult(result);
    setLastCommandNotice(result.actionTaken);
    setVoiceState('success');

    setTimeout(() => {
      setVoiceState('idle');
    }, 2400);
  }, [rooms, playFeedbackTone]);

  // Toggle individual device
  const handleToggleDevice = useCallback((roomId: string, deviceId: string) => {
    playFeedbackTone(580);
    setRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      const updatedDevices = room.devices.map(d => {
        if (d.id !== deviceId) return d;
        return { ...d, status: !d.status };
      });
      return {
        ...room,
        devices: updatedDevices,
        activeCount: updatedDevices.filter(d => d.status).length
      };
    }));
  }, [playFeedbackTone]);

  // Update device slider value
  const handleUpdateDeviceValue = useCallback((roomId: string, deviceId: string, value: number) => {
    setRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      const updatedDevices = room.devices.map(d => {
        if (d.id !== deviceId) return d;
        return { ...d, value, status: value > 0 };
      });
      return {
        ...room,
        devices: updatedDevices,
        activeCount: updatedDevices.filter(d => d.status).length
      };
    }));
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0a0a0c] overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'hero' ? (
          <motion.div
            key="hero-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <HeroScreen
              rooms={rooms}
              isListening={voiceState === 'listening'}
              onArmMic={handleArmMic}
              onEnter={handleEnterNimbus}
              lastCommandNotice={lastCommandNotice}
            />
          </motion.div>
        ) : (
          <motion.div
            key="shelf-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <RoomShelfScreen
              rooms={rooms}
              onBack={handleBackToHero}
              onToggleDevice={handleToggleDevice}
              onUpdateDeviceValue={handleUpdateDeviceValue}
              onOpenVoice={handleArmMic}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Assistant HUD Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        state={voiceState}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setVoiceState('idle');
        }}
        onExecuteCommand={handleExecuteCommand}
        lastResult={lastVoiceResult}
      />
    </div>
  );
}
