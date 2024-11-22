import React from 'react';
import { useOnlineGame } from '../hooks/useOnlineGame';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import GameBoard from './GameBoard';
import { Loader2 } from 'lucide-react';

export default function OnlineGame() {
  const [user] = useAuthState(auth);
  const { gameData, isSearching, error, findGame } = useOnlineGame(user?.uid || '');

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 p-4 rounded-lg">
        <p className="text-red-500">{error}</p>
        <button
          onClick={findGame}
          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Finding opponent...</span>
      </div>
    );
  }

  if (!gameData) {
    return (
      <button
        onClick={findGame}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Find Game
      </button>
    );
  }

  return (
    <GameBoard
      mode="online"
      orientation={gameData.whitePlayer === user?.uid ? 'white' : 'black'}
    />
  );
}