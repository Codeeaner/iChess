import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { updateDoc, onSnapshot, collection, addDoc, DocumentReference, doc } from 'firebase/firestore';
import { Trophy, Users, Clock, Calendar, Award } from 'lucide-react';
import { useTournamentStore } from '../store/tournamentStore';
import TournamentChat from './TournamentChat';
import LoadingSpinner from './LoadingSpinner';
import { formatTimeControl } from '../lib/utils';
import { Tournament } from '../types/game';

export default function TournamentLobby() {
  const [user] = useAuthState(auth);
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { activeTournament, setTournament, generateNextRound } = useTournamentStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;

    const unsubscribe = onSnapshot(doc(db, 'tournaments', tournamentId), async (tournamentDoc) => {
      if (tournamentDoc.exists()) {
        const tournamentData = tournamentDoc.data() as Tournament;
        setTournament(tournamentData);

        // Check if tournament is starting and user is a participant
        if (tournamentData.status === 'ongoing' && 
            tournamentData.participants.includes(user?.uid || '') &&
            tournamentData.currentRound > 0) {
          
          // Find user's current match
          const currentRound = tournamentData.rounds[tournamentData.currentRound - 1];
          const userMatch = currentRound.matches.find(
            match => match.whitePlayer === user?.uid || match.blackPlayer === user?.uid
          );

          if (userMatch && !userMatch.gameId) {
            // Create a new game for this match
            const gameRef = await addDoc(collection(db, 'tournament_games'), {
              tournamentId,
              whitePlayer: userMatch.whitePlayer,
              blackPlayer: userMatch.blackPlayer,
              status: 'playing',
              currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              moves: [],
              timeControl: tournamentData.timeControl,
              createdAt: new Date()
            });

            // Update the match with the game ID
            userMatch.gameId = gameRef.id;
            const tournamentDocRef: DocumentReference = tournamentDoc.ref;
            await updateDoc(tournamentDocRef, {
              rounds: tournamentData.rounds
            });

            // Navigate to the game
            navigate(`/tournament/${tournamentId}/game/${gameRef.id}`);
          } else if (userMatch?.gameId) {
            // Navigate to existing game
            navigate(`/tournament/${tournamentId}/game/${userMatch.gameId}`);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tournamentId, user]);

  if (loading || !activeTournament) {
    return <LoadingSpinner fullScreen />;
  }

  const sortedPlayers = [...activeTournament.players].sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-[1fr_300px] gap-8 max-w-[1600px] mx-auto p-4">
      <div className="space-y-6">
        {/* Tournament Header */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{activeTournament.name}</h1>
              <p className="text-gray-400">
                {activeTournament.format.charAt(0).toUpperCase() + activeTournament.format.slice(1)} Tournament
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-blue-400">
                Round {activeTournament.currentRound}/{activeTournament.rounds.length}
              </div>
              <p className="text-gray-400">{activeTournament.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">Time Control</p>
              <p className="text-lg font-semibold">
                {formatTimeControl(activeTournament.timeControl.initial, activeTournament.timeControl.increment)}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <Users className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">Players</p>
              <p className="text-lg font-semibold">{activeTournament.players.length}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">Prize Pool</p>
              <p className="text-lg font-semibold">{activeTournament.prizePool} Points</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <Award className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-lg font-semibold capitalize">{activeTournament.status}</p>
            </div>
          </div>
        </div>

        {/* Current Round */}
        {activeTournament.currentRound > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Current Round Pairings</h2>
            <div className="space-y-2">
              {activeTournament.rounds[activeTournament.currentRound - 1].matches.map((match, idx) => {
                const whitePlayer = activeTournament.players.find(p => p.uid === match.whitePlayer);
                const blackPlayer = activeTournament.players.find(p => p.uid === match.blackPlayer);
                return (
                  <div key={idx} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span>{whitePlayer?.name}</span>
                      <span className="text-gray-400">({whitePlayer?.rating})</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400">vs</span>
                      {match.result && (
                        <span className="font-mono">{match.result}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{blackPlayer?.name}</span>
                      <span className="text-gray-400">({blackPlayer?.rating})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standings */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Standings</h2>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.uid}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 w-8">{index + 1}</span>
                  <span className={player.uid === user?.uid ? 'text-blue-400' : ''}>
                    {player.name}
                  </span>
                </div>
                <div className="flex items-center space-x-8">
                  <span className="text-gray-400">{player.rating}</span>
                  <span className="font-bold w-8 text-right">{player.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Chat */}
      <div className="space-y-4">
        <TournamentChat tournamentId={tournamentId!} />
      </div>
    </div>
  );
}