import React from 'react';
import { ArrowRight, CircleDot } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedBlob } from './AnimatedBlob';
import { MicSlider } from './MicSlider';
import { FloatingGlassCard } from './FloatingGlassCard';
import { Room } from '../types';

interface HeroScreenProps {
  rooms: Room[];
  isListening: boolean;
  onArmMic: () => void;
  onEnter: () => void;
  lastCommandNotice?: string | null;
}

export const HeroScreen: React.FC<HeroScreenProps> = ({
  rooms,
  isListening,
  onArmMic,
  onEnter
}) => {
  // Derive real statistics from app state
  const totalRooms = rooms.length;
  const totalDevices = rooms.reduce((sum, r) => sum + r.devices.length, 0);

  return (
    <div
      id="nimbus-hero-screen"
      className="relative w-full h-screen max-h-screen bg-[#0a0a0c] text-white flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. SLOW SOFT AMBIENT MONOCHROMATIC AURORA */}
      <motion.div 
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.18, 0.32, 0.18]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full pointer-events-none z-0 blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(120, 126, 140, 0.15) 45%, transparent 75%)'
        }}
      />

      {/* 2. NAV (Generous macro padding, clean double-bezel CTA button) */}
      <header
        id="nav-bar"
        className="relative z-40 w-full max-w-7xl mx-auto px-8 sm:px-14 pt-7 sm:pt-8 pb-4 flex items-center justify-between flex-shrink-0"
      >
        {/* Left: Brand logo + dot + "Eden" wordmark with monochrome accent */}
        <div id="nav-brand-logo" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-white/[0.04] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-sm">
            <div className="relative flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-white/90" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
            </div>
          </div>

          <span className="font-mono-code text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Eden
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </span>
        </div>

        {/* Right: Nested Double-Bezel "Enter Eden" button with circular chip arrow */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="p-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        >
          <button
            id="btn-nav-enter-nimbus"
            onClick={onEnter}
            className="group pl-4 pr-1.5 py-1.5 rounded-full bg-[#121318]/90 border border-white/[0.08] hover:border-white/30 flex items-center gap-3 text-white font-mono-code text-[12px] font-semibold tracking-wide transition-all cursor-pointer select-none"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12)'
            }}
            aria-label="Enter Eden application"
          >
            <span>Enter Eden</span>
            {/* Trailing arrow nested in circular chip */}
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 group-hover:bg-white group-hover:border-white group-hover:text-[#0a0a0c] flex items-center justify-center text-white/80 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </motion.div>
      </header>

      {/* 3. MAIN HERO ZONE (Centerpiece Animated Blob, Double-Bezel Card & Mic Slider) */}
      <main className="relative z-30 flex-1 w-full max-w-7xl mx-auto px-8 sm:px-14 flex flex-col items-center justify-center min-h-0 py-4 sm:py-8">
        <div className="relative w-full flex flex-col items-center justify-center">

          {/* CENTERPIECE BLOB CONTAINER - Sized 320-380px on desktop */}
          <div className="relative z-10 flex items-center justify-center my-2 sm:my-4">
            <div className="hidden sm:block">
              <AnimatedBlob size={3.5} />
            </div>
            <div className="block sm:hidden">
              <AnimatedBlob size={2.7} />
            </div>
          </div>

          {/* FLOATING GLASS CARD (Positioned right of blob on desktop, stacks below on mobile) */}
          <div className="lg:absolute lg:right-6 lg:top-1/2 lg:-translate-y-1/2 mt-5 lg:mt-0 z-30">
            <FloatingGlassCard
              roomsCount={totalRooms}
              devicesCount={totalDevices}
              onCardClick={onEnter}
            />
          </div>

          {/* MIC-ARM SLIDER (Single primary voice interaction below the blob) */}
          <div className="mt-6 sm:mt-8 z-30">
            <MicSlider
              isListening={isListening}
              onArmMic={onArmMic}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

