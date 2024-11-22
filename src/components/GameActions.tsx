import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Flag, Handshake, RotateCcw, X } from 'lucide-react';

interface GameActionsProps {
  gameId: string;
  gameData: any;
  isCreator: boolean;
  userId?: string;
  onRequestTakeback: () => void;
  onRespondTakeback: (accept: boolean) => void;
}

export default function GameActions({ gameId, gameData, isCreator, userId, onRequestTakeback, onRespondTakeback }: GameActionsProps) {
  const handleResign = async () => {
    if (!gameId || !userId) return;

    const winner = userId === gameData.creator ? gameData.opponent : gameData.creator;
    await updateDoc(doc(db, 'private_games', gameId), {
      status: 'completed',
      result: `${winner === gameData.creator ? 'White' : 'Black'} wins by resignation`
    });
  };

  const handleDrawOffer = async () => {
    if (!gameId || !userId) return;

    if (gameData.drawOffer?.pending) {
      if (gameData.drawOffer.from !== userId) {
        // Accept draw offer
        await updateDoc(doc(db, 'private_games', gameId), {
          status: 'completed',
          result: 'Game drawn by agreement',
          drawOffer: null
        });
      }
    } else {
      // Make draw offer
      await updateDoc(doc(db, 'private_games', gameId), {
        drawOffer: {
          from: userId,
          pending: true
        }
      });
    }
  };

  const handleTakebackRequest = async () => {
    if (!gameId || !userId) return;

    if (gameData.takebackRequest?.pending) {
      if (gameData.takebackRequest.from !== userId) {
        // Accept takeback
        const moves = [...gameData.moves];
        moves.pop();
        await updateDoc(doc(db, 'private_games', gameId), {
          moves,
          takebackRequest: null,
          currentFen: gameData.previousFen
        });
      }
    } else {
      // Request takeback
      await updateDoc(doc(db, 'private_games', gameId), {
        takebackRequest: {
          from: userId,
          pending: true
        }
      });
    }
  };

  const cancelRequest = async (type: 'draw' | 'takeback') => {
    if (!gameId || !userId) return;

    await updateDoc(doc(db, 'private_games', gameId), {
      [type === 'draw' ? 'drawOffer' : 'takebackRequest']: null
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold mb-4">Game Actions</h3>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={handleResign}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <Flag className="w-5 h-5" />
          <span>Resign</span>
        </button>

        <button
          onClick={handleDrawOffer}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            gameData.drawOffer?.pending
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Handshake className="w-5 h-5" />
          <span>
            {gameData.drawOffer?.pending
              ? gameData.drawOffer.from === userId
                ? 'Draw Offered'
                : 'Accept Draw'
              : 'Offer Draw'}
          </span>
        </button>

        <button
          onClick={handleTakebackRequest}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            gameData.takebackRequest?.pending
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span>
            {gameData.takebackRequest?.pending
              ? gameData.takebackRequest.from === userId
                ? 'Takeback Requested'
                : 'Accept Takeback'
              : 'Request Takeback'}
          </span>
        </button>

        {(gameData.drawOffer?.from === userId || gameData.takebackRequest?.from === userId) && (
          <button
            onClick={() => cancelRequest(gameData.drawOffer?.from === userId ? 'draw' : 'takeback')}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Cancel Request</span>
          </button>
        )}

        {gameData.takebackRequest?.pending && gameData.takebackRequest.from !== userId && (
          <div className="flex space-x-2">
            <button 
              onClick={() => onRespondTakeback(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Accept Takeback
            </button>
            <button 
              onClick={() => onRespondTakeback(false)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Decline
            </button>
          </div>
        )}

        {!gameData.takebackRequest?.pending && (
          <button
            onClick={onRequestTakeback}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Request Takeback
          </button>
        )}
      </div>

      {gameData.status === 'completed' && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg text-center">
          <p className="text-lg font-semibold">{gameData.result}</p>
        </div>
      )}
    </div>
  );
}