import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';

interface GameData {
  gameId: string;
  whitePlayer: string;
  blackPlayer: string;
  currentFen: string;
}

export function useOnlineGame(userId: string) {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socket.on('game_found', (data: GameData) => {
      setGameData(data);
      setIsSearching(false);
    });

    socket.on('move_made', ({ fen }) => {
      if (gameData) {
        setGameData({ ...gameData, currentFen: fen });
      }
    });

    socket.on('game_error', (message) => {
      setError(message);
      setIsSearching(false);
    });

    return () => {
      socket.off('game_found');
      socket.off('move_made');
      socket.off('game_error');
    };
  }, [gameData]);

  const findGame = () => {
    setIsSearching(true);
    setError(null);
    socket.emit('find_game', { userId });
  };

  const makeMove = (move: string) => {
    if (gameData) {
      socket.emit('make_move', {
        gameId: gameData.gameId,
        move,
        userId,
      });
    }
  };

  return {
    gameData,
    isSearching,
    error,
    findGame,
    makeMove,
  };
}