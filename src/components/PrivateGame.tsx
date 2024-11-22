import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import PrivateGameChat from './PrivateGameChat';
import GameActions from './GameActions';
import GameClock from './GameClock';
import { Loader2, Copy } from 'lucide-react';

interface TimeControl {
  initial: number; // in seconds
  increment: number; // in seconds
}

interface PrivateGameData {
  creator: string;
  creatorName: string;
  opponent?: string;
  opponentName?: string;
  status: 'waiting' | 'playing' | 'completed';
  currentFen: string;
  moves: string[];
  turn: 'w' | 'b';
  timeControl: TimeControl;
  whiteTime: number;
  blackTime: number;
  lastMoveTime?: number;
  takebackRequest?: {
    from: string;
    pending: boolean;
  };
  drawOffer?: {
    from: string;
    pending: boolean;
  };
  result?: string;
}

interface GameIdDisplayProps {
  gameId: string;
}

const GameIdDisplay: React.FC<GameIdDisplayProps> = ({ gameId }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy game ID');
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
      <span className="text-sm text-gray-300">Game ID: </span>
      <code className="font-mono text-sm">{gameId}</code>
      <button
        onClick={copyGameId}
        className="p-1 hover:bg-gray-600 rounded transition-colors"
        title="Copy Game ID"
      >
        <Copy className="w-4 h-4" />
      </button>
      {copySuccess && (
        <span className="text-green-500 text-xs">Copied!</span>
      )}
    </div>
  );
};

export default function PrivateGame({ gameId }: { gameId: string }) {
  const [user] = useAuthState(auth);
  const [gameData, setGameData] = useState<PrivateGameData | null>(null);
  const [game] = useState(new Chess());
  const [loading, setLoading] = useState(true);
  const [premove, setPremove] = useState<{ from: Square; to: Square } | null>(null);
  const [animatedWhiteTime, setAnimatedWhiteTime] = useState(gameData?.whiteTime || 0);
  const [animatedBlackTime, setAnimatedBlackTime] = useState(gameData?.blackTime || 0);

  useEffect(() => {
    if (!gameId || !user) return;

    const joinGame = async () => {
      const gameRef = doc(db, 'private_games', gameId);
      const gameDoc = await getDoc(gameRef);
      
      if (gameDoc.exists() && gameDoc.data().status === 'waiting' && gameDoc.data().creator !== user.uid) {
        await updateDoc(gameRef, {
          opponent: user.uid,
          opponentName: user.displayName || 'Anonymous',
          status: 'playing',
          lastMoveTime: Date.now()
        });
      }
    };

    joinGame();

    const unsubscribe = onSnapshot(doc(db, 'private_games', gameId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as PrivateGameData;
        setGameData(data);
        if (data.currentFen) {
          game.load(data.currentFen);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId, user, game]);

  // Update the useEffect for time animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (gameData?.status === 'playing') {
      const now = Date.now();
      const timeSpent = gameData.lastMoveTime ? (now - gameData.lastMoveTime) / 1000 : 0;
      
      // Always update both times based on the current turn
      if (game.turn() === 'w') {
        setAnimatedWhiteTime(Math.max(0, gameData.whiteTime - timeSpent));
        setAnimatedBlackTime(gameData.blackTime);
      } else {
        setAnimatedBlackTime(Math.max(0, gameData.blackTime - timeSpent));
        setAnimatedWhiteTime(gameData.whiteTime);
      }

      // Update time every 100ms
      intervalId = setInterval(() => {
        if (game.turn() === 'w') {
          setAnimatedWhiteTime(prev => Math.max(0, prev - 0.1));
        } else {
          setAnimatedBlackTime(prev => Math.max(0, prev - 0.1));
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameData?.status, gameData?.lastMoveTime, game.turn(), gameData?.whiteTime, gameData?.blackTime]);

  // Update handleMove function to ensure consistent time updates
  const handleMove = async (from: string, to: string) => {
    if (!gameData || !user || !gameId) return false;

    const isPlayerTurn = 
      (game.turn() === 'w' && user.uid === gameData.creator) ||
      (game.turn() === 'b' && user.uid === gameData.opponent);

    if (!isPlayerTurn || gameData.status !== 'playing') return false;

    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (move) {
        const now = Date.now();
        const timeSpent = gameData.lastMoveTime ? (now - gameData.lastMoveTime) / 1000 : 0;
        const isWhite = game.turn() === 'b'; // Previous turn was white
        
        // Update times consistently
        const newWhiteTime = isWhite ? 
          Math.max(0, gameData.whiteTime - timeSpent) :
          gameData.whiteTime;
        
        const newBlackTime = !isWhite ? 
          Math.max(0, gameData.blackTime - timeSpent) :
          gameData.blackTime;

        await updateDoc(doc(db, 'private_games', gameId), {
          currentFen: game.fen(),
          moves: [...(gameData.moves || []), `${from}${to}`],
          turn: game.turn(),
          lastMoveTime: now,
          whiteTime: newWhiteTime,
          blackTime: newBlackTime
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handlePremove = (from: Square, to: Square) => {
    if (!gameData || !user) return false;
    
    const isPlayerTurn = 
      (game.turn() === 'w' && user.uid === gameData.creator) ||
      (game.turn() === 'b' && user.uid === gameData.opponent);

    // If it's player's turn, make the regular move
    if (isPlayerTurn) {
      return handleMove(from, to);
    }

    // Only set premove if it's not player's turn
    const isPlayer = user.uid === gameData.creator || user.uid === gameData.opponent;
    if (isPlayer && gameData.status === 'playing') {
      setPremove({ from, to });
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (premove && gameData) {
      const isPlayerTurn = 
        (game.turn() === 'w' && user?.uid === gameData.creator) ||
        (game.turn() === 'b' && user?.uid === gameData.opponent);

      if (isPlayerTurn) {
        handleMove(premove.from, premove.to);
        setPremove(null);
      }
    }
  }, [gameData?.turn]);

  // Add these functions in PrivateGame.tsx

  const requestTakeback = async () => {
    if (!gameData || !user || !gameId) return;
    
    try {
      await updateDoc(doc(db, 'private_games', gameId), {
        takebackRequest: {
          from: user.uid,
          pending: true
        }
      });
    } catch (error) {
      console.error('Error requesting takeback:', error);
    }
  };

  // Update handleTakebackResponse function
  const handleTakebackResponse = async (accept: boolean) => {
    if (!gameData || !user || !gameId || !gameData.takebackRequest) return;

    try {
      if (accept) {
        // Get the last move
        const lastMove = gameData.moves[gameData.moves.length - 1];
        const newMoves = gameData.moves.slice(0, -1);
        
        // Load previous position
        const previousGame = new Chess();
        newMoves.forEach(move => {
          const from = move.substring(0, 2) as Square;
          const to = move.substring(2) as Square;
          previousGame.move({ from, to, promotion: 'q' });
        });

        await updateDoc(doc(db, 'private_games', gameId), {
          currentFen: previousGame.fen(),
          moves: newMoves,
          turn: previousGame.turn(),
          takebackRequest: null,
          // Keep current time values without increment
          whiteTime: gameData.whiteTime,
          blackTime: gameData.blackTime,
          lastMoveTime: Date.now() // Reset move timer
        });
      } else {
        // Just clear the takeback request
        await updateDoc(doc(db, 'private_games', gameId), {
          takebackRequest: null
        });
      }
    } catch (error) {
      console.error('Error handling takeback:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!gameData) {
    return <div>Game not found</div>;
  }

  const isCreator = user?.uid === gameData.creator;
  const orientation = isCreator ? 'white' : 'black';

  return (
    <div className="grid grid-cols-[300px_1fr_300px] gap-8 max-w-[1600px] mx-auto p-4">
      <div className="space-y-4">
        <PrivateGameChat gameId={gameId} />
      </div>

      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          {/* Top clock */}
          <div className="flex justify-between items-center mb-4">
            <GameClock
              time={orientation === 'white' ? animatedBlackTime : animatedWhiteTime}
              active={gameData.status === 'playing' && 
                (orientation === 'white' ? game.turn() === 'b' : game.turn() === 'w')}
              player={orientation === 'white' 
                ? gameData.opponentName || 'Unknown' 
                : gameData.creatorName || 'Unknown'
              }
            />
          </div>
          
          {/* Chessboard */}
          <div className="w-full max-w-[600px] mx-auto">
            <Chessboard
              position={game.fen()}
              onPieceDrop={(from, to) => {
                handlePremove(from as Square, to as Square);
                return true;
              }}
              boardOrientation={orientation}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
              }}
              arePremovesAllowed={true}
              customSquareStyles={{
                ...(premove ? {
                  [premove.from]: { backgroundColor: 'rgba(255, 170, 0, 0.4)' },
                  [premove.to]: { backgroundColor: 'rgba(255, 170, 0, 0.4)' }
                } : {})
              }}
            />
          </div>

          {/* Bottom clock */}
          <div className="mt-4 flex justify-between items-center">
            <GameClock
              time={orientation === 'white' ? animatedWhiteTime : animatedBlackTime}
              active={gameData.status === 'playing' && 
                (orientation === 'white' ? game.turn() === 'w' : game.turn() === 'b')}
              player={orientation === 'white' 
                ? gameData.creatorName || 'Unknown' 
                : gameData.opponentName || 'Unknown'
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <GameActions
          gameId={gameId}
          gameData={gameData}
          isCreator={isCreator}
          userId={user?.uid}
          onRequestTakeback={requestTakeback}
          onRespondTakeback={handleTakebackResponse}
        />
        <GameIdDisplay gameId={gameId} />
      </div>
    </div>
  );
}