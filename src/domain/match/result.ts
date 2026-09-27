export type MatchOutcome = "勝利" | "敗戦" | "引き分け";

export function matchOutcome(playerGames: number, opponentGames: number): MatchOutcome {
  if (playerGames > opponentGames) {
    return "勝利";
  }
  if (opponentGames > playerGames) {
    return "敗戦";
  }
  return "引き分け";
}
