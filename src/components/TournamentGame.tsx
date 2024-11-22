import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useTournamentStore } from '../store/tournamentStore';
import PrivateGame from './PrivateGame';
import LoadingSpinner from './LoadingSpinner';
import { Tournament } from '../types/game';

export default function TournamentGame() {
  const [user] = useAuthState(auth);
  const { tournamentId, gameId } = useParams();
  const navigate = useNavigate();
  const { activeTournament, setTournament } = useTournamentStore();

  useEffect(() => {
    if (!tournamentId || !gameId || !user) return;

    // Listen for tournament updates
    const tournamentUnsubscribe = onSnapshot(
      doc(db, 'tournaments', tournamentId),
      (doc) => {
        if (doc.exists()) {
          setTournament(doc.data() as Tournament);
        }
      }
    );

    // Listen for game updates
    const gameUnsubscribe = onSnapshot(
      doc(db, 'tournament_games', gameId),
      async (doc) => {
        if (!doc.exists()) {
          navigate(`/tournament/${tournamentId}`);
          return;
        }

        const gameData = doc.data();
        
        // If game is finished, update tournament scores and redirect
        if (gameData.status === 'completed') {
          await updateTournamentScores(gameData);
          navigate(`/tournament/${tournamentId}`);
        }
      }
    );

    return () => {
      tournamentUnsubscribe();
      gameUnsubscribe();
    };
  }, [tournamentId, gameId, user]);

  const updateTournamentScores = async (gameData: any) => {
    if (!tournamentId || !activeTournament) return;

    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const currentRound = activeTournament.rounds[activeTournament.currentRound - 1];
    
    // Find the match in the current round
    const match = currentRound.matches.find(
      m => m.whitePlayer === gameData.whitePlayer && m.blackPlayer === gameData.blackPlayer
    );

    if (match) {
      match.result = gameData.result;
      
      // Update player scores
      const updatedPlayers = activeTournament.players.map(player => {
        if (player.uid === gameData.winner) {
          return { ...player, score: player.score + 1 };
        }
        if (gameData.result === '1/2-1/2' && 
            (player.uid === gameData.whitePlayer || player.uid === gameData.blackPlayer)) {
          return { ...player, score: player.score + 0.5 };
        }
        return player;
      });

      await updateDoc(tournamentRef, {
        players: updatedPlayers,
        rounds: activeTournament.rounds
      });
    }
  };

  if (!user || !tournamentId || !gameId) {
    return <LoadingSpinner fullScreen />;
  }

  return <PrivateGame gameId={gameId} />;
}