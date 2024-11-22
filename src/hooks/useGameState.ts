import { useState, useCallback } from 'react';
import { Chess, Move } from 'chess.js';

export type GameMode = 'computer' | 'online' | null;
export type GameDifficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  fen: string;
  isGameOver: boolean;
  turn: 'w' | 'b';
  result: string | null;
}

export function useGameState(initialFen?: string) {
  const [game] = useState(new Chess(initialFen));
  const [gameState, setGameState] = useState<GameState>({
    fen: game.fen(),
    isGameOver: game.isGameOver(),
    turn: game.turn(),
    result: null,
  });

  const makeMove = useCallback((move: string | Move) => {
    try {
      const result = game.move(move);
      if (result) {
        const newState = {
          fen: game.fen(),
          isGameOver: game.isGameOver(),
          turn: game.turn(),
          result: game.isGameOver() 
            ? game.isCheckmate() 
              ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`
              : game.isDraw()
              ? 'Game drawn!'
              : 'Game over!'
            : null,
        };
        setGameState(newState);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [game]);

  const getLegalMoves = useCallback(() => {
    return game.moves({ verbose: true });
  }, [game]);

  return {
    gameState,
    makeMove,
    getLegalMoves,
  };
}