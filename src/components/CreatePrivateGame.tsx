import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { Clock, Loader2, Copy, ExternalLink } from 'lucide-react';

const timeControls = [
  { label: '5+0', initial: 300, increment: 0 },
  { label: '10+0', initial: 600, increment: 0 },
  { label: '15+10', initial: 900, increment: 10 },
  { label: '30+0', initial: 1800, increment: 0 }
];

export default function CreatePrivateGame() {
  const [user] = useAuthState(auth);
  const [selectedTime, setSelectedTime] = useState(timeControls[0]);
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdGameId, setCreatedGameId] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

  const createGame = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const gameRef = await addDoc(collection(db, 'private_games'), {
        creator: user.uid,
        creatorName: user.displayName || 'Anonymous',
        status: 'waiting',
        currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: [],
        turn: 'w',
        timeControl: {
          initial: selectedTime.initial,
          increment: selectedTime.increment
        },
        whiteTime: selectedTime.initial,
        blackTime: selectedTime.initial,
        createdAt: new Date(),
        messages: []
      });

      setCreatedGameId(gameRef.id);
      navigate(`/game/${gameRef.id}`);
    } catch (error) {
      setError('Error creating game');
    } finally {
      setLoading(false);
    }
  };

  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(createdGameId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy game ID');
    }
  };

  const joinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      const gameRef = doc(db, 'private_games', gameId);
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        setError('Game not found');
        return;
      }

      const gameData = gameDoc.data();
      if (gameData.status === 'completed') {
        setError('This game has already ended');
        return;
      }

      navigate(`/game/${gameId}`);
    } catch (error) {
      setError('Error joining game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Game Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Create New Game</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeControls.map((time) => (
                <button
                  key={time.label}
                  onClick={() => setSelectedTime(time)}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                    selectedTime === time
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-blue-500/50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{time.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createGame}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>Create Game</span>
          </button>

          {createdGameId && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-300">Game ID:</p>
                  <p className="font-mono">{createdGameId}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyGameId}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Copy Game ID"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/game/${createdGameId}`)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Go to Game"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {copySuccess && (
                <p className="text-green-500 text-sm">Copied to clipboard!</p>
              )}
            </div>
          )}
        </div>

        {/* Join Game Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Join Game</h2>
          <form onSubmit={joinGame} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Game ID
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter game ID"
              />
            </div>
          </form>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}