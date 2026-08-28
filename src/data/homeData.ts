import { Room, SmartDevice, VoiceCommandResult } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    tag: 'ZONE-01',
    iconName: 'Sofa',
    temperature: 71,
    energyUsage: '1.4 kWh',
    activeCount: 3,
    devices: [
      { id: 'lr-light-main', name: 'Ambient Cove Lights', type: 'light', room: 'Living Room', status: true, value: 85, unit: '%', color: '#60a5fa' },
      { id: 'lr-media-tv', name: '4K OLED Display', type: 'media', room: 'Living Room', status: true, value: 42, unit: 'vol' },
      { id: 'lr-climate-ac', name: 'Dual Inverter HVAC', type: 'climate', room: 'Living Room', status: true, value: 71, unit: '°F' },
      { id: 'lr-shades', name: 'Motorized Sun Shades', type: 'blind', room: 'Living Room', status: false, value: 0, unit: '%' }
    ]
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    tag: 'ZONE-02',
    iconName: 'Utensils',
    temperature: 70,
    energyUsage: '2.1 kWh',
    activeCount: 3,
    devices: [
      { id: 'kt-pendant-lights', name: 'Island Pendant Lights', type: 'light', room: 'Kitchen & Dining', status: true, value: 100, unit: '%', color: '#fbbf24' },
      { id: 'kt-exhaust-fan', name: 'Quiet Induction Hood', type: 'fan', room: 'Kitchen & Dining', status: false, value: 0, unit: 'rpm' },
      { id: 'kt-smart-oven', name: 'Convection Pro Oven', type: 'media', room: 'Kitchen & Dining', status: true, value: 375, unit: '°F' }
    ]
  },
  {
    id: 'master-bedroom',
    name: 'Master Suite',
    tag: 'ZONE-03',
    iconName: 'BedDouble',
    temperature: 68,
    energyUsage: '0.8 kWh',
    activeCount: 3,
    devices: [
      { id: 'br-light-accent', name: 'Circadian Headboard Glow', type: 'light', room: 'Master Suite', status: true, value: 40, unit: '%', color: '#a78bfa' },
      { id: 'br-ceiling-fan', name: 'Breeze Ceiling Fan', type: 'fan', room: 'Master Suite', status: true, value: 60, unit: '%' },
      { id: 'br-air-purifier', name: 'HEPA Air Ionizer', type: 'climate', room: 'Master Suite', status: true, value: 98, unit: 'AQI' }
    ]
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    tag: 'ZONE-04',
    iconName: 'Cpu',
    temperature: 69,
    energyUsage: '1.2 kWh',
    activeCount: 3,
    devices: [
      { id: 'cs-light-diffuse', name: 'Keylight Diffuser', type: 'light', room: 'Creative Studio', status: true, value: 90, unit: '%', color: '#38bdf8' },
      { id: 'cs-smart-lock', name: 'Biometric Deadbolt', type: 'security', room: 'Creative Studio', status: true, value: 100, unit: 'sec' }
    ]
  }
];

export function parseVoiceCommand(transcript: string, currentRooms: Room[]): {
  updatedRooms: Room[];
  result: VoiceCommandResult;
} {
  const lower = transcript.toLowerCase().trim();
  let actionTaken = 'Command processed';
  const updatedRooms = JSON.parse(JSON.stringify(currentRooms)) as Room[];
  const affected: string[] = [];

  // Match lights
  if (lower.includes('light') || lower.includes('lights') || lower.includes('glow') || lower.includes('lamp')) {
    const turnOff = lower.includes('off') || lower.includes('shut') || lower.includes('kill') || lower.includes('disable');
    const turnOn = lower.includes('on') || lower.includes('bright') || lower.includes('illuminate') || lower.includes('enable');
    const isDim = lower.includes('dim') || lower.includes('half');
    
    // Check specific room
    const targetRoom = updatedRooms.find(r => lower.includes(r.name.toLowerCase()) || lower.includes(r.id.replace('-', ' ')));

    updatedRooms.forEach(room => {
      if (!targetRoom || room.id === targetRoom.id) {
        room.devices.forEach(dev => {
          if (dev.type === 'light') {
            if (turnOff) {
              dev.status = false;
              dev.value = 0;
              actionTaken = `Turned off ${dev.name} in ${room.name}`;
            } else if (turnOn) {
              dev.status = true;
              dev.value = 100;
              actionTaken = `Turned on ${dev.name} in ${room.name}`;
            } else if (isDim) {
              dev.status = true;
              dev.value = 35;
              actionTaken = `Dimmed ${dev.name} to 35% in ${room.name}`;
            }
            affected.push(dev.id);
          }
        });
      }
    });

    if (!actionTaken.includes('Turned') && !actionTaken.includes('Dimmed')) {
      actionTaken = `Adjusted smart lighting across ${targetRoom ? targetRoom.name : 'all rooms'}`;
    }
  } 
  // Climate / temperature
  else if (lower.includes('temperature') || lower.includes('temp') || lower.includes('degrees') || lower.includes('warm') || lower.includes('cool') || lower.includes('ac')) {
    const tempMatch = lower.match(/\b(6[5-9]|7[0-9]|8[0-0])\b/);
    const targetTemp = tempMatch ? parseInt(tempMatch[0], 10) : 72;

    updatedRooms.forEach(room => {
      room.temperature = targetTemp;
      room.devices.forEach(dev => {
        if (dev.type === 'climate') {
          dev.status = true;
          dev.value = targetTemp;
          affected.push(dev.id);
        }
      });
    });
    actionTaken = `Set home climate target to ${targetTemp}°F`;
  }
  // Lock / Security
  else if (lower.includes('lock') || lower.includes('secure') || lower.includes('guard')) {
    updatedRooms.forEach(room => {
      room.devices.forEach(dev => {
        if (dev.type === 'security') {
          dev.status = true;
          affected.push(dev.id);
        }
      });
    });
    actionTaken = `All access points & studio deadbolts secured`;
  }
  // All off / Night mode
  else if (lower.includes('night') || lower.includes('sleep') || lower.includes('all off') || lower.includes('leaving')) {
    updatedRooms.forEach(room => {
      room.devices.forEach(dev => {
        if (dev.type === 'light' || dev.type === 'media') {
          dev.status = false;
        } else if (dev.type === 'security') {
          dev.status = true;
        }
        affected.push(dev.id);
      });
    });
    actionTaken = `Night scene activated: all lights extinguished and doors locked`;
  }
  // Party / Movie / Vibe mode
  else if (lower.includes('movie') || lower.includes('cinema') || lower.includes('party')) {
    updatedRooms.forEach(room => {
      room.devices.forEach(dev => {
        if (dev.id === 'lr-light-main') {
          dev.status = true;
          dev.value = 20;
          dev.color = '#3b82f6';
        }
        if (dev.id === 'lr-media-tv') {
          dev.status = true;
          dev.value = 55;
        }
        if (dev.id === 'lr-shades') {
          dev.status = true;
          dev.value = 100;
        }
        affected.push(dev.id);
      });
    });
    actionTaken = `Cinema preset engaged: shades lowered, backlight dimmed to electric blue`;
  }
  else {
    // Default smart action
    actionTaken = `Processed voice directive: "${transcript}"`;
  }

  // Recalculate active counts
  updatedRooms.forEach(room => {
    room.activeCount = room.devices.filter(d => d.status).length;
  });

  return {
    updatedRooms,
    result: {
      transcript,
      actionTaken,
      affectedDevices: affected,
      timestamp: new Date()
    }
  };
}
