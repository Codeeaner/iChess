import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { GiChessKnight, GiChessQueen, GiTrophy, GiChessKing } from 'react-icons/gi';
import GameBoard from './GameBoard';
import { GameMode, GameDifficulty } from '../hooks/useGameState';
import CreatePrivateGame from './CreatePrivateGame';

export default function GameLobby() {
  const [user] = useAuthState(auth);
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrivateGame, setShowPrivateGame] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);

  if (!user) return null;

  const handleGameEnd = (result: string) => {
    console.log('Game ended:', result);
  };

  const startGame = (mode: GameMode, diff?: GameDifficulty) => {
    setGameMode(mode);
    if (diff) setDifficulty(diff);
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setIsPlaying(false)}
          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors"
        >
          Back to Lobby
        </button>
        <GameBoard 
          mode={gameMode} 
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
        />
      </div>
    );
  }

  if (showPrivateGame) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowPrivateGame(false)}
          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors"
        >
          Back to Lobby
        </button>
        <CreatePrivateGame />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white">Play Chess</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setGameMode('computer')}
          className={`h-full w-full p-6 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
            gameMode === 'computer'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-blue-500/50'
          }`}
        >
          <GiChessKnight className="w-8 h-8 mb-2 text-blue-400" />
          <h3 className="text-lg font-semibold mb-2">Play vs Computer</h3>
          <p className="text-sm text-gray-400">Challenge the AI at various difficulty levels</p>
        </button>

        <button
          onClick={() => setGameMode('online')}
          className={`h-full w-full p-6 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
            gameMode === 'online'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 hover:border-blue-500/50'
          }`}
        >
          <GiChessQueen className="w-8 h-8 mb-2 text-blue-400" />
          <h3 className="text-lg font-semibold mb-2">Quick Match</h3>
          <p className="text-sm text-gray-400">Play against random opponents online</p>
        </button>

        <button
          onClick={() => setShowPrivateGame(true)}
          className="h-full w-full p-6 rounded-lg border-2 border-gray-700 hover:border-blue-500/50 flex flex-col items-center justify-center transition-all"
        >
          <GiChessKing className="w-8 h-8 mb-2 text-blue-400" />
          <h3 className="text-lg font-semibold mb-2">Create Private Game</h3>
          <p className="text-sm text-gray-400">Play with a friend using a private game code</p>
        </button>
      </div>

      {gameMode && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {gameMode === 'computer' ? 'Select Difficulty' : 'Game Settings'}
          </h3>
          {gameMode === 'computer' ? (
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as GameDifficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => startGame('computer', level)}
                  className="w-full px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors capitalize"
                >
                  {level}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => startGame('online')}
                className="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Quick Match
              </button>
              <button 
                onClick={() => setShowPrivateGame(true)}
                className="w-full px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors"
              >
                Create Private Game
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}