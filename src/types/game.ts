export type GameMode = 'computer' | 'online' | null;
export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface GameHistory {
  id: string;
  whitePlayer: string;
  blackPlayer: string;
  result: string;
  moves: string[];
  date: Date;
  pgn: string;
  timeControl: string;
}

export interface TournamentPlayer {
  uid: string;
  name: string;
  rating: number;
  score: number;
  currentRound: number;
}



export interface Tournament {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  format: 'swiss' | 'roundRobin' | 'knockout';
  timeControl: {

    initial: number;

    increment: number;

  };
  participants: string[];
  rounds: TournamentRound[];
  status: 'upcoming' | 'ongoing' | 'completed';
  prizePool: number;
  players: TournamentPlayer[];
  currentRound: number;
  winner?: string; 
  maxPlayers: number;
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  whitePlayer: string;
  blackPlayer: string;
  result: string | null;
  scheduledTime: Date;
  gameId: string | null;
}