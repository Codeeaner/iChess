import React, { useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { usePuzzles } from '../hooks/usePuzzles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Chess } from 'chess.js';

export default function PuzzleBoard() {
  const [user] = useAuthState(auth);
  const { puzzle, loading, checkMove, nextPuzzle } = usePuzzles(user?.uid || '');
  const [game] = React.useState(new Chess());

  const handleMove = useCallback((sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move && checkMove(`${sourceSquare}${targetSquare}`)) {
        return true;
      }
      
      game.undo();
      return false;
    } catch {
      return false;
    }
  }, [game, checkMove]);

  if (loading || !puzzle) {
    return <div>Loading puzzle...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Chess Puzzle</h3>
        <p className="text-sm text-gray-400">Theme: {puzzle.theme}</p>
        <p className="text-sm text-gray-400">Rating: {puzzle.rating}</p>
      </div>

      <div className="w-full max-w-[600px] aspect-square">
        <Chessboard
          position={puzzle.fen}
          onPieceDrop={handleMove}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
          }}
        />
      </div>

      <button
        onClick={nextPuzzle}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        Next Puzzle
      </button>
    </div>
  );
}