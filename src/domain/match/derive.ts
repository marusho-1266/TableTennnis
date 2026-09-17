import { isDeuce, isGameComplete, isMatchComplete } from "./rules";
import type { PointOutcome } from "./types";

export interface PointInput {
  id: string;
  outcome: PointOutcome;
  category: string;
  detail: string | null;
  recordedAt?: string;
}

export interface DerivedPoint extends PointInput {
  sequence: number;
  gameNumber: number;
  scoreAfter: {
    player: number;
    opponent: number;
  };
}

export interface CompletedGame {
  gameNumber: number;
  playerScore: number;
  opponentScore: number;
  winner: "player" | "opponent";
  points: DerivedPoint[];
}

export interface MatchView {
  games: CompletedGame[];
  current: {
    gameNumber: number;
    playerScore: number;
    opponentScore: number;
    points: DerivedPoint[];
  };
  gamesWon: {
    player: number;
    opponent: number;
  };
  matchOver: boolean;
  deuce: boolean;
  history: DerivedPoint[];
  recentCurrentGame: DerivedPoint[];
}

export function deriveMatch(points: readonly PointInput[]): MatchView {
  const games: CompletedGame[] = [];
  const history: DerivedPoint[] = [];
  let playerScore = 0;
  let opponentScore = 0;
  let gamesWonPlayer = 0;
  let gamesWonOpponent = 0;
  let gameNumber = 1;
  let currentPoints: DerivedPoint[] = [];

  points.forEach((point, index) => {
    if (point.outcome === "won") {
      playerScore += 1;
    } else {
      opponentScore += 1;
    }

    const derived: DerivedPoint = {
      ...point,
      sequence: index + 1,
      gameNumber,
      scoreAfter: { player: playerScore, opponent: opponentScore },
    };

    currentPoints.push(derived);
    history.push(derived);

    if (isGameComplete(playerScore, opponentScore)) {
      const winner = playerScore > opponentScore ? "player" : "opponent";
      if (winner === "player") {
        gamesWonPlayer += 1;
      } else {
        gamesWonOpponent += 1;
      }

      games.push({
        gameNumber,
        playerScore,
        opponentScore,
        winner,
        points: currentPoints,
      });

      gameNumber += 1;
      playerScore = 0;
      opponentScore = 0;
      currentPoints = [];
    }
  });

  return {
    games,
    current: {
      gameNumber,
      playerScore,
      opponentScore,
      points: currentPoints,
    },
    gamesWon: { player: gamesWonPlayer, opponent: gamesWonOpponent },
    matchOver: isMatchComplete(gamesWonPlayer, gamesWonOpponent),
    deuce: isDeuce(playerScore, opponentScore),
    history,
    recentCurrentGame: currentPoints.slice(-3).reverse(),
  };
}
