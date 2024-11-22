import React, { useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameState, GameMode, GameDifficulty } from '../hooks/useGameState';
import { getComputerMove } from '../lib/computerPlayer';

interface GameBoardProps {
  mode: GameMode;
  difficulty?: GameDifficulty;
  orientation?: 'white' | 'black';
  onGameEnd?: (result: string) => void;
}

export default function GameBoard({ 
  mode, 
  difficulty = 'medium',
  orientation = 'white',
  onGameEnd 
}: GameBoardProps) {
  const { gameState, makeMove, getLegalMoves } = useGameState();

  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move && mode === 'computer' && !gameState.isGameOver) {
      // Computer's turn
      setTimeout(() => {
        const legalMoves = getLegalMoves();
        if (legalMoves.length > 0) {
          const computerMove = getComputerMove(legalMoves, gameState.fen, difficulty);
          makeMove(computerMove);
        }
      }, 300);
    }

    return move;
  }, [makeMove, mode, gameState, difficulty, getLegalMoves]);

  useEffect(() => {
    if (gameState.result && onGameEnd) {
      onGameEnd(gameState.result);
    }
  }, [gameState.result, onGameEnd]);

  return (
    <div className="w-full max-w-[600px] aspect-square">
      <Chessboard 
        position={gameState.fen}
        onPieceDrop={handleMove}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
      />
      {gameState.result && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg text-center">
          <p className="text-lg font-semibold">{gameState.result}</p>
        </div>
      )}
    </div>
  );
}