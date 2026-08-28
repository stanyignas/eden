import React, { useState, useRef, useEffect } from 'react';
import { Mic, ArrowRight, Radio } from 'lucide-react';
import { motion, useMotionValue, animate } from 'motion/react';

interface MicSliderProps {
  isListening: boolean;
  onArmMic: () => void;
  className?: string;
}

export const MicSlider: React.FC<MicSliderProps> = ({
  isListening,
  onArmMic,
  className = ''
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isArmed, setIsArmed] = useState(false);
  const [trackWidth, setTrackWidth] = useState(280);
  const handleSize = 44; // px

  const x = useMotionValue(0);
  const maxDrag = Math.max(0, trackWidth - handleSize - 8);

  // Update track width dynamically
  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // When listening completes or resets, spring back handle
  useEffect(() => {
    if (!isListening && !isArmed) {
      animate(x, 0, { type: 'spring', stiffness: 450, damping: 30 });
    }
  }, [isListening, isArmed, x]);

  // Pointer drag logic
  const handleDrag = (_: any, info: { offset: { x: number } }) => {
    const currentX = info.offset.x;
    if (currentX >= maxDrag * 0.85 && !isArmed) {
      setIsArmed(true);
      onArmMic();
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
    }
  };

  const handleDragEnd = () => {
    setIsArmed(false);
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 32 });
  };

  return (
    <div id="mic-arm-slider-container" className={`flex flex-col items-center select-none ${className}`}>
      {/* Main Track - Double-bezel rounded-full capsule */}
      <div className="w-[270px] sm:w-[290px]">
        <div
          id="mic-pill-outer-track"
          ref={trackRef}
          className={`relative w-full h-[54px] p-1 rounded-full bg-white/[0.04] border border-white/10 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ${
            isListening ? 'border-white shadow-[0_0_25px_rgba(255,255,255,0.3)]' : 'hover:border-white/20'
          }`}
        >
          {/* Inner Track Surface */}
          <div 
            className="absolute inset-1 rounded-full bg-[#111216]/90 border border-white/[0.04] flex items-center justify-between px-5 pointer-events-none text-white/30 font-mono-code text-[11px] font-semibold tracking-wider overflow-hidden"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08)'
            }}
          >
            <span className="opacity-0">.</span>
            <span className="flex items-center gap-1.5 uppercase text-[10px] sm:text-[11px] text-white/40">
              {isListening ? 'Streaming voice...' : 'Slide to speak'}
              <ArrowRight className="w-3 h-3 text-white/80 opacity-70" />
            </span>
          </div>

          {/* Drag Handle with Mic Icon */}
          <motion.div
            id="mic-drag-handle"
            drag="x"
            dragConstraints={{ left: 0, right: maxDrag }}
            dragElastic={0.08}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`relative z-10 w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all border ${
              isListening 
                ? 'bg-white text-[#0a0a0c] border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/20 shadow-md'
            }`}
            aria-label="Drag to speak"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-[#0a0a0c]' : 'text-white'}`} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

