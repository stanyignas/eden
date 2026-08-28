import React, { useState } from 'react';
import { 
  ArrowLeft, Mic, Sun, Wind, Lock, Tv,
  Zap, Flame
} from 'lucide-react';
import { Room, SmartDevice } from '../types';

interface RoomShelfScreenProps {
  rooms: Room[];
  onBack: () => void;
  onToggleDevice: (roomId: string, deviceId: string) => void;
  onUpdateDeviceValue: (roomId: string, deviceId: string, value: number) => void;
  onOpenVoice: () => void;
}

export const RoomShelfScreen: React.FC<RoomShelfScreenProps> = ({
  rooms,
  onBack,
  onToggleDevice,
  onUpdateDeviceValue,
  onOpenVoice
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'living-room');

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
  const totalDevices = rooms.reduce((acc, r) => acc + r.devices.length, 0);
  const activeDevices = rooms.reduce((acc, r) => acc + r.devices.filter(d => d.status).length, 0);

  const getDeviceIcon = (type: SmartDevice['type']) => {
    switch (type) {
      case 'light': return Sun;
      case 'fan': return Wind;
      case 'climate': return Flame;
      case 'security': return Lock;
      case 'media': return Tv;
      default: return Zap;
    }
  };

  return (
    <div id="room-shelf-screen" className="relative w-full h-screen overflow-y-auto bg-[#0a0a0c] text-white flex flex-col select-none">
      {/* Soft monochromatic ambient glow at top */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(120, 126, 140, 0.15) 55%, transparent 80%)'
        }}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 h-16 px-6 sm:px-12 flex items-center justify-between border-b border-white/10 bg-[#0a0a0c]/85 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            id="btn-back-to-hero"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-sm font-mono-code text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Back to Hero Core"
          >
            <ArrowLeft className="w-4 h-4 text-white/90" />
            <span>Core View</span>
          </button>

          <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="text-xs font-mono-code text-white/70 tracking-wider uppercase">
              {activeDevices}/{totalDevices} Devices Active
            </span>
          </div>
        </div>

        {/* Center Title */}
        <div className="font-mono-code text-sm font-semibold tracking-wider flex items-center gap-2">
          <span className="text-white">EDEN</span>
          <span className="text-white/30">/</span>
          <span className="text-white/70">SPATIAL SHELF</span>
        </div>

        {/* Right Voice Trigger */}
        <button
          onClick={onOpenVoice}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#e4e7eb] text-[#0a0a0c] text-xs font-bold font-mono-code shadow-lg shadow-white/10 transition-all active:scale-95 cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5 text-[#0a0a0c]" />
          <span className="hidden sm:inline">Voice Core</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-12 flex flex-col gap-8">
        {/* Room Tab Selector Shelf */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {rooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const activeInRoom = room.devices.filter(d => d.status).length;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex-shrink-0 px-5 py-3.5 rounded-2xl border transition-all text-left flex items-center gap-4 cursor-pointer ${
                  isSelected
                    ? 'bg-[#181920] border-white/80 shadow-[0_0_25px_rgba(255,255,255,0.15)]'
                    : 'bg-[#111217]/80 border-white/10 hover:border-white/20 hover:bg-[#15161c]'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono-code text-white/70 tracking-wider uppercase font-semibold">
                    {room.tag}
                  </div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    {room.name}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] font-mono-code text-white/70">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeInRoom > 0 ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`} />
                  <span>{activeInRoom}/{room.devices.length}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Room Header Card */}
        {selectedRoom && (
          <div className="rounded-3xl bg-[#111217]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
               style={{ boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.08)' }}>
            <div>
              <div className="flex items-center gap-2 font-mono-code text-xs text-white/80 mb-1.5 uppercase tracking-widest font-semibold">
                <span>ACTIVE ZONE</span>
                <span>•</span>
                <span>{selectedRoom.tag}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedRoom.name}
              </h1>
              <p className="text-sm text-white/60 mt-1 font-mono-code">
                Ambient Thermals: {selectedRoom.temperature}°F • Consumption: {selectedRoom.energyUsage}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  selectedRoom.devices.forEach(d => {
                    if (!d.status) onToggleDevice(selectedRoom.id, d.id);
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-mono-code text-white transition-all cursor-pointer active:scale-95"
              >
                All On
              </button>
              <button
                onClick={() => {
                  selectedRoom.devices.forEach(d => {
                    if (d.status) onToggleDevice(selectedRoom.id, d.id);
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono-code text-white/60 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                All Off
              </button>
            </div>
          </div>
        )}

        {/* Devices Grid */}
        {selectedRoom && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedRoom.devices.map((device) => {
              const IconComponent = getDeviceIcon(device.type);
              return (
                <div
                  key={device.id}
                  className={`rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md flex flex-col justify-between ${
                    device.status
                      ? 'bg-[#181922] border-white/30 shadow-[0_10px_30px_rgba(255,255,255,0.06)]'
                      : 'bg-[#101116]/80 border-white/10 opacity-75'
                  }`}
                  style={{
                    boxShadow: device.status ? 'inset 0 1px 1px rgba(255, 255, 255, 0.15)' : 'inset 0 1px 1px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Top Bar: Icon + Toggle */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      device.status
                        ? 'bg-white text-[#0a0a0c] shadow-md'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <button
                      onClick={() => onToggleDevice(selectedRoom.id, device.id)}
                      className={`w-12 h-7 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                        device.status ? 'bg-white' : 'bg-white/20'
                      }`}
                      aria-label={`Toggle ${device.name}`}
                    >
                      <div className={`w-6 h-6 rounded-full transition-transform ${
                        device.status ? 'translate-x-5 shadow-md bg-[#0a0a0c]' : 'translate-x-0 bg-white'
                      }`} />
                    </button>
                  </div>

                  {/* Device Info */}
                  <div className="mb-4">
                    <div className="font-mono-code text-[11px] uppercase tracking-wider text-white/40">
                      {device.type}
                    </div>
                    <div className="font-bold text-base text-white mt-0.5 tracking-tight">
                      {device.name}
                    </div>
                  </div>

                  {/* Level Slider or Status Display */}
                  {device.value !== undefined && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex justify-between items-center text-xs font-mono-code mb-2">
                        <span className="text-white/50">Level / Setpoint</span>
                        <span className="text-white font-semibold">
                          {device.value} {device.unit}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={device.type === 'climate' ? 60 : 0}
                        max={device.type === 'climate' ? 85 : 100}
                        value={device.value}
                        onChange={(e) => onUpdateDeviceValue(selectedRoom.id, device.id, Number(e.target.value))}
                        disabled={!device.status}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-30"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

