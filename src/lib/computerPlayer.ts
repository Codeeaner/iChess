import { Move } from 'chess.js';
import { GameDifficulty } from '../hooks/useGameState';

function evaluatePosition(fen: string): number {
  // Basic material evaluation
  const pieces = fen.split(' ')[0];
  let score = 0;
  const values: { [key: string]: number } = {
    'p': -1, 'P': 1,
    'n': -3, 'N': 3,
    'b': -3, 'B': 3,
    'r': -5, 'R': 5,
    'q': -9, 'Q': 9,
  };

  for (const char of pieces) {
    if (char in values) {
      score += values[char];
    }
  }
  return score;
}

function getRandomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

function getBestMove(moves: Move[], fen: string, depth: number): Move {
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const score = evaluatePosition(fen) * (depth % 2 === 0 ? 1 : -1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getComputerMove(moves: Move[], fen: string, difficulty: GameDifficulty): Move {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(moves);
    case 'medium':
      return Math.random() < 0.7 
        ? getBestMove(moves, fen, 2)
        : getRandomMove(moves);
    case 'hard':
      return getBestMove(moves, fen, 3);
    default:
      return getRandomMove(moves);
  }
}