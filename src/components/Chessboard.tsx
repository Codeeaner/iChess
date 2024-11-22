import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ChessboardProps {
  onMove?: (move: string) => void;
  position?: string;
  orientation?: 'white' | 'black';
}

export default function GameBoard({ onMove, position, orientation = 'white' }: ChessboardProps) {
  const [game] = useState(new Chess(position));
  
  function makeAMove(move: any) {
    try {
      const result = game.move(move);
      if (result && onMove) {
        onMove(game.fen());
      }
      return result;
    } catch (error) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) return false;
    return true;
  }

  return (
    <div className="w-full max-w-[600px] aspect-square">
      <Chessboard 
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={orientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
      />
    </div>
  );
}