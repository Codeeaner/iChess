import { TournamentPlayer } from '../types/game';

export function calculateEloChange(playerRating: number, opponentRating: number, score: number): number {
  const K = 32; // K-factor
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(K * (score - expectedScore));
}

export function generatePairings(players: TournamentPlayer[]): [TournamentPlayer, TournamentPlayer][] {
  // Sort players by score, then rating
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.rating - a.rating;
  });

  const pairings: [TournamentPlayer, TournamentPlayer][] = [];
  const used = new Set<string>();

  // Try to pair players with similar scores
  for (let i = 0; i < sortedPlayers.length; i++) {
    if (used.has(sortedPlayers[i].uid)) continue;

    // Find the best opponent
    let bestOpponentIndex = -1;
    let minScoreDiff = Infinity;

    for (let j = i + 1; j < sortedPlayers.length; j++) {
      if (used.has(sortedPlayers[j].uid)) continue;

      const scoreDiff = Math.abs(sortedPlayers[i].score - sortedPlayers[j].score);
      if (scoreDiff < minScoreDiff) {
        minScoreDiff = scoreDiff;
        bestOpponentIndex = j;
      }
    }

    if (bestOpponentIndex !== -1) {
      pairings.push([sortedPlayers[i], sortedPlayers[bestOpponentIndex]]);
      used.add(sortedPlayers[i].uid);
      used.add(sortedPlayers[bestOpponentIndex].uid);
    }
  }

  // Handle odd number of players - give bye to lowest rated unpaired player
  const unpaired = sortedPlayers.filter(p => !used.has(p.uid));
  if (unpaired.length === 1) {
    // Give a bye (counts as a win)
    const player = unpaired[0];
    player.score += 1;
  }

  return pairings;
}