import { create } from 'zustand';
import { Tournament, TournamentPlayer } from '../types/game';
import { calculateEloChange, generatePairings } from '../lib/tournament';

interface TournamentState {
  activeTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  setTournament: (tournament: Tournament) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  generateNextRound: () => void;
  finishTournament: () => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  activeTournament: null,
  loading: false,
  error: null,

  setTournament: (tournament) => set({ activeTournament: tournament }),

  updatePlayerScore: (playerId, score) => {
    const tournament = get().activeTournament;
    if (!tournament) return;

    const updatedPlayers = tournament.players.map(player => {
      if (player.uid === playerId) {
        return { ...player, score };
      }
      return player;
    });

    set({
      activeTournament: {
        ...tournament,
        players: updatedPlayers
      }
    });
  },

  generateNextRound: () => {
    const tournament = get().activeTournament;
    if (!tournament) return;

    const players = tournament.players as TournamentPlayer[];
    const pairings = generatePairings(players);
    const newRound = {
      roundNumber: tournament.currentRound + 1,
      matches: pairings.map(([white, black]) => ({
        whitePlayer: white.uid,
        blackPlayer: black.uid,
        result: null,
        scheduledTime: new Date(),
        gameId: null
      }))
    };

    set({
      activeTournament: {
        ...tournament,
        currentRound: tournament.currentRound + 1,
        rounds: [...tournament.rounds, newRound]
      }
    });
  },

  finishTournament: () => {
    const tournament = get().activeTournament;
    if (!tournament) return;

    // Sort players by score
    const sortedPlayers = [...tournament.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    // Calculate final Elo changes
    const updatedPlayers = tournament.players.map(player => {
      const matches = tournament.rounds.flatMap(round => 
        round.matches.filter(match => 
          match.whitePlayer === player.uid || match.blackPlayer === player.uid
        )
      );

      const eloChange = matches.reduce((total, match) => {
        if (!match.result) return total;
        const isWhite = match.whitePlayer === player.uid;
        const opponent = tournament.players.find(p => 
          p.uid === (isWhite ? match.blackPlayer : match.whitePlayer)
        );
        if (!opponent) return total;
        
        return total + calculateEloChange(
          player.rating,
          opponent.rating,
          match.result === (isWhite ? '1-0' : '0-1') ? 1 : 
          match.result === '1/2-1/2' ? 0.5 : 0
        );
      }, 0);

      return {
        ...player,
        rating: player.rating + eloChange
      };
    });

    set({
      activeTournament: {
        ...tournament,
        status: 'completed',
        winner: winner.uid,
        players: updatedPlayers
      }
    });
  }
}));