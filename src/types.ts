export interface SmartDevice {
  id: string;
  name: string;
  type: 'light' | 'climate' | 'media' | 'security' | 'fan' | 'blind';
  room: string;
  status: boolean;
  value?: number; // e.g. brightness 0-100, temp in °F, volume
  unit?: string;
  color?: string;
}

export interface Room {
  id: string;
  name: string;
  tag: string;
  iconName: string;
  devices: SmartDevice[];
  temperature: number;
  energyUsage: string;
  activeCount: number;
}

export type VoiceState = 'idle' | 'arming' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceCommandResult {
  transcript: string;
  actionTaken: string;
  affectedDevices?: string[];
  timestamp: Date;
}
