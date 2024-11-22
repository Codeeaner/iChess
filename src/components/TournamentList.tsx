import React, { useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../firebase';
import { GiTrophy } from 'react-icons/gi';
import { format } from 'date-fns';
import CreateTournament from './CreateTournament';
import { useNavigate } from 'react-router-dom';

export default function TournamentList() {
  const [tournaments, loading] = useCollection(collection(db, 'tournaments'));
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading tournaments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Tournaments</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Tournament
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <CreateTournament onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {tournaments?.docs.map((doc) => {
          const tournament = doc.data();
          return (
            <div 
              key={doc.id} 
              className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => navigate(`/tournament/${doc.id}`)}
            >
              <div className="flex items-center space-x-4">
                <GiTrophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="text-xl font-semibold">{tournament.name}</h3>
                  <p className="text-sm text-gray-400">
                    Starts: {format(tournament.startDate.toDate(), 'PPP')}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Players</p>
                  <p className="text-lg font-semibold">{tournament.participants.length}/{tournament.maxPlayers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Format</p>
                  <p className="text-lg font-semibold capitalize">{tournament.format}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Prize Pool</p>
                  <p className="text-lg font-semibold">{tournament.prizePool} Points</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}