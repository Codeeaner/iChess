import { Chess, Move } from 'chess.js';
import { GameDifficulty } from '../types/game';

// Piece values for position evaluation
const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

// Position weights for piece-square tables (simplified)
const POSITION_WEIGHTS = {
  p: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10,-20,-20, 10, 10,  5,
    5, -5,-10,  0,  0,-10, -5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5,  5, 10, 25, 25, 10,  5,  5,
    10, 10, 20, 30, 30, 20, 10, 10,
    50, 50, 50, 50, 50, 50, 50, 50,
    0,  0,  0,  0,  0,  0,  0,  0
  ]
};

function evaluatePosition(game: Chess): number {
  let score = 0;
  const fen = game.fen().split(' ')[0];
  const squares = fen.split('/').join('');
  
  // Material evaluation
  for (let i = 0; i < squares.length; i++) {
    const piece = squares[i];
    if (piece in PIECE_VALUES) {
      const pieceKey = piece.toLowerCase() as keyof typeof PIECE_VALUES;
      const value = PIECE_VALUES[pieceKey];
      score += piece.toLowerCase() === piece ? -value : value;
    }
  }

  // Position evaluation (only for pawns as example)
  squares.split('').forEach((piece, index) => {
    if (piece.toLowerCase() === 'p') {
      const positionScore = POSITION_WEIGHTS.p[piece === 'P' ? index : 63 - index];
      score += piece === 'P' ? positionScore : -positionScore;
    }
  });

  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game);
  }

  const moves = game.moves({ verbose: true });
  
  if (maximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

export function getBestMove(game: Chess, difficulty: GameDifficulty): Move {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return moves[0];

  // Depth based on difficulty
  const depth = {
    easy: 1,
    medium: 2,
    hard: 3
  }[difficulty];

  // For easy difficulty, sometimes make random moves
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    game.move(move);
    const score = minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}