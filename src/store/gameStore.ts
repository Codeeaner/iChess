import { create } from 'zustand';
import { Chess } from 'chess.js';
import { GameMode, GameDifficulty } from '../types/game';

interface GameState {
  game: Chess;
  mode: GameMode;
  difficulty: GameDifficulty;
  isPlayerTurn: boolean;
  gameOver: boolean;
  result: string | null;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  makeMove: (from: string, to: string) => boolean;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  game: new Chess(),
  mode: null,
  difficulty: 'medium',
  isPlayerTurn: true,
  gameOver: false,
  result: null,
  
  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  
  makeMove: (from, to) => {
    const { game } = get();
    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (move) {
        set({
          isPlayerTurn: !get().isPlayerTurn,
          gameOver: game.isGameOver(),
          result: game.isGameOver() 
            ? game.isCheckmate()
              ? `${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`
              : game.isDraw()
                ? 'Game drawn!'
                : 'Game over!'
            : null
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  
  resetGame: () => set({
    game: new Chess(),
    isPlayerTurn: true,
    gameOver: false,
    result: null
  })
}));