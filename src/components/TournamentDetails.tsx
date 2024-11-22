import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { format } from 'date-fns';
import { Trophy, Users, Clock, Calendar, Award } from 'lucide-react';
import { Tournament } from '../types/game';

export default function TournamentDetails() {
  const [user] = useAuthState(auth);
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!id) return;

      try {
        const tournamentDoc = await getDoc(doc(db, 'tournaments', id));
        if (tournamentDoc.exists()) {
          setTournament({ id: tournamentDoc.id, ...tournamentDoc.data() } as Tournament);
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleJoinTournament = async () => {
    if (!user || !tournament || !id) return;

    try {
      await updateDoc(doc(db, 'tournaments', id), {
        participants: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  const handleLeaveTournament = async () => {
    if (!user || !tournament || !id) return;

    try {
      await updateDoc(doc(db, 'tournaments', id), {
        participants: arrayRemove(user.uid)
      });
    } catch (error) {
      console.error('Error leaving tournament:', error);
    }
  };

  if (loading) {
    return <div>Loading tournament details...</div>;
  }

  if (!tournament) {
    return <div>Tournament not found</div>;
  }

  const hasJoined = tournament.participants.includes(user?.uid || '');
  const canJoin = tournament.status === 'upcoming' && tournament.participants.length < tournament.maxPlayers;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <p className="text-gray-400">
              {format(tournament.startDate, 'PPP')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <Users className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Players</p>
            <p className="text-lg font-semibold">
              {tournament.participants.length}/{tournament.maxPlayers}
            </p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Time Control</p>
            <p className="text-lg font-semibold">{`${tournament.timeControl.initial} + ${tournament.timeControl.increment}`}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Format</p>
            <p className="text-lg font-semibold capitalize">{tournament.format}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <Award className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-sm text-gray-400">Prize Pool</p>
            <p className="text-lg font-semibold">{tournament.prizePool} Points</p>
          </div>
        </div>

        {user && (
          <div className="flex justify-center">
            {!hasJoined ? (
              <button
                onClick={handleJoinTournament}
                disabled={!canJoin}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {canJoin ? 'Join Tournament' : 'Tournament Full'}
              </button>
            ) : (
              <button
                onClick={handleLeaveTournament}
                disabled={tournament.status !== 'upcoming'}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Leave Tournament
              </button>
            )}
          </div>
        )}
      </div>

      {tournament.rounds.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Tournament Rounds</h2>
          <div className="space-y-4">
            {tournament.rounds.map((round) => (
              <div key={round.roundNumber} className="space-y-2">
                <h3 className="font-semibold">Round {round.roundNumber}</h3>
                <div className="grid gap-2">
                  {round.matches.map((match, idx) => (
                    <div key={idx} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                      <span>{match.whitePlayer}</span>
                      <span className="text-gray-400">vs</span>
                      <span>{match.blackPlayer}</span>
                      {match.result && (
                        <span className="text-gray-400 ml-4">{match.result}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Participants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tournament.participants.map((participantId) => (
            <div key={participantId} className="bg-gray-700 p-4 rounded-lg">
              <Users className="w-5 h-5 text-gray-400 mb-2" />
              <p className="truncate">{participantId}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}