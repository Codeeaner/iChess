import React from 'react';
import { User } from 'lucide-react';

interface GameClockProps {
  time: number;
  active: boolean;
  player: string;
}

export default function GameClock({ time, active, player }: GameClockProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
      active ? 'bg-blue-500/20 border border-blue-500' : 'bg-gray-700'
    }`}>
      <User className="w-5 h-5" />
      <span className="font-medium">{player}</span>
      <span className={`font-mono text-xl ${
        time < 30 ? 'text-red-500' : ''
      }`}>
        {formatTime(time)}
      </span>
    </div>
  );
}