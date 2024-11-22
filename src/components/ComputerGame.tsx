import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getBestMove } from '../lib/computerAI';
import GameBoard from './GameBoard';
import GameControls from './GameControls';

export default function ComputerGame() {
  const { game, makeMove, difficulty, isPlayerTurn, gameOver } = useGameStore();

  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      // Add a small delay to make the computer's moves feel more natural
      const timeoutId = setTimeout(() => {
        const move = getBestMove(game, difficulty);
        if (move) {
          makeMove(move.from, move.to);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isPlayerTurn, gameOver, game, difficulty, makeMove]);

  const handleMove = (from: string, to: string) => {
    if (!isPlayerTurn || gameOver) return false;
    return makeMove(from, to);
  };

  return (
    <div className="space-y-4">
      <GameBoard
        position={game.fen()}
        orientation="white"
        onMove={handleMove}
      />
      <GameControls />
    </div>
  );
}