export function isGameComplete(playerScore: number, opponentScore: number): boolean {
  const leaderScore = Math.max(playerScore, opponentScore);
  const scoreDifference = Math.abs(playerScore - opponentScore);

  return leaderScore >= 11 && scoreDifference >= 2;
}

export function isDeuce(playerScore: number, opponentScore: number): boolean {
  return playerScore >= 10 && opponentScore >= 10;
}

export function isMatchComplete(playerGames: number, opponentGames: number): boolean {
  return playerGames === 3 || opponentGames === 3;
}
