import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export default function PlayerStats() {
  const [user] = useAuthState(auth);
  const [gamesSnapshot, gamesLoading] = useCollection(
    user ? query(
      collection(db, 'games'),
      where('players', 'array-contains', user.uid)
    ) : null
  );

  const [tournamentsSnapshot, tournamentsLoading] = useCollection(
    user ? query(
      collection(db, 'tournaments'),
      where('participants', 'array-contains', user.uid)
    ) : null
  );

  if (!user) return null;
  if (gamesLoading || tournamentsLoading) {
    return <LoadingSpinner />;
  }

  const games = gamesSnapshot?.docs || [];
  const tournaments = tournamentsSnapshot?.docs || [];

  const stats = {
    rating: 1500, // Default rating
    gamesPlayed: games.length,
    wins: games.filter(game => {
      const data = game.data();
      return (data.winner === user.uid);
    }).length,
    tournamentsWon: tournaments.filter(tournament => {
      const data = tournament.data();
      return data.winner === user.uid;
    }).length
  };

  const winRate = stats.gamesPlayed > 0 
    ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">Player Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-sm text-gray-400">Rating</p>
          <p className="text-2xl font-bold">{stats.rating}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <Target className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-sm text-gray-400">Games Played</p>
          <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-sm text-gray-400">Win Rate</p>
          <p className="text-2xl font-bold">{winRate}%</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <Award className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-sm text-gray-400">Tournaments Won</p>
          <p className="text-2xl font-bold">{stats.tournamentsWon}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {games.slice(0, 5).map((game) => {
            const data = game.data();
            const isWinner = data.winner === user.uid;
            return (
              <div
                key={game.id}
                className={`p-3 rounded-lg ${
                  isWinner ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>vs {data.opponentName}</span>
                  <span className={isWinner ? 'text-green-500' : 'text-red-500'}>
                    {isWinner ? 'Won' : 'Lost'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}