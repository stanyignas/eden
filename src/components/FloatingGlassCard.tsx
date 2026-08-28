import React from 'react';
import { Plus, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingGlassCardProps {
  roomsCount: number;
  devicesCount: number;
  onCardClick?: () => void;
  className?: string;
}

export const FloatingGlassCard: React.FC<FloatingGlassCardProps> = ({
  roomsCount,
  devicesCount,
  onCardClick,
  className = ''
}) => {
  return (
    <motion.div
      id="floating-glass-card-outer"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onCardClick}
      className={`group relative w-full sm:w-[270px] p-1.5 rounded-[20px] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] cursor-pointer select-none transition-all hover:border-white/30 ${className}`}
    >
      {/* Inner Surface with Soft Inset Top Highlight & Concentric 16px Radius */}
      <div 
        id="floating-glass-card-inner"
        className="relative w-full rounded-[16px] bg-[#111217]/90 border border-white/[0.06] p-4 transition-colors group-hover:bg-[#14151c]/95"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-[6px] bg-white/10 border border-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:border-white/30 transition-colors">
              <Plus className="w-3 h-3" />
            </div>
            <span className="font-mono-code text-[11px] font-semibold text-white/95 tracking-tight">
              Your Home, By Voice
            </span>
          </div>

          {/* Small circular chip top-right */}
          <div className="w-6 h-6 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/60 group-hover:bg-white group-hover:text-[#0a0a0c] group-hover:border-white transition-all">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stat Pills Row (live from app state) */}
        <div className="flex flex-col gap-2">
          {/* Rooms Connected */}
          <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-black/50 border border-white/[0.05] text-[11px] font-mono-code text-[#a1a1aa] transition-colors group-hover:border-white/10">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span>Rooms Connected</span>
            </span>
            <span className="text-white font-bold">{roomsCount}</span>
          </div>

          {/* Devices Online */}
          <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-black/50 border border-white/[0.05] text-[11px] font-mono-code text-[#a1a1aa] transition-colors group-hover:border-white/10">
            <span className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-white/80" />
              <span>Devices Online</span>
            </span>
            <span className="text-white font-bold">{devicesCount}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

