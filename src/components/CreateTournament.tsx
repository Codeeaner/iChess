import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Calendar, Clock, Trophy, Users, X } from 'lucide-react';

interface CreateTournamentProps {
  onClose: () => void;
}

const timeControls = [
  { label: '5+0', minutes: 5, increment: 0 },
  { label: '10+0', minutes: 10, increment: 0 },
  { label: '15+10', minutes: 15, increment: 10 }
];

const tournamentFormats = [
  { label: 'Swiss', value: 'swiss' },
  { label: 'Round Robin', value: 'roundRobin' },
  { label: 'Knockout', value: 'knockout' }
];

export default function CreateTournament({ onClose }: CreateTournamentProps) {
  const [user] = useAuthState(auth);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [format, setFormat] = useState(tournamentFormats[0].value);
  const [timeControl, setTimeControl] = useState(timeControls[0]);
  const [maxPlayers, setMaxPlayers] = useState(32);
  const [prizePool, setPrizePool] = useState(1000);

  const createTournament = async () => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'tournaments'), {
        name,
        startDate: new Date(startDate),
        endDate: new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000),
        format,
        timeControl,
        maxPlayers,
        prizePool,
        participants: [user.uid],
        createdBy: user.uid,
        createdAt: new Date(),
        status: 'upcoming',
        rounds: []
      });

      onClose();
    } catch (error) {
      console.error('Error creating tournament:', error);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Create Tournament</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tournament Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tournament name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Start Date
          </label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tournament Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tournamentFormats.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  format === f.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Time Control
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timeControls.map((time) => (
              <button
                key={time.label}
                onClick={() => setTimeControl(time)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  timeControl === time
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximum Players
          </label>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="flex-1 p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={8}>8 Players</option>
              <option value={16}>16 Players</option>
              <option value={32}>32 Players</option>
              <option value={64}>64 Players</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prize Pool (Points)
          </label>
          <input
            type="number"
            value={prizePool}
            onChange={(e) => setPrizePool(Number(e.target.value))}
            min={100}
            step={100}
            className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={createTournament}
          disabled={!name || !startDate}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Create Tournament
        </button>
      </div>
    </div>
  );
}