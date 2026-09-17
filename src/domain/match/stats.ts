import { POINT_CATEGORIES } from "./categories";
import { deriveMatch, type PointInput } from "./derive";
import type { PointOutcome } from "./types";

export interface CategoryCount {
  category: string;
  count: number;
  share: number;
}

export interface GameStats {
  gameNumber: number;
  won: CategoryCount[];
  lost: CategoryCount[];
}

export interface MatchStats {
  games: GameStats[];
  overall: {
    won: CategoryCount[];
    lost: CategoryCount[];
  };
}

export function deriveStats(points: readonly PointInput[]): MatchStats {
  const view = deriveMatch(points);
  const games = view.games.map((game) => ({
    gameNumber: game.gameNumber,
    won: countsFor(game.points, "won"),
    lost: countsFor(game.points, "lost"),
  }));

  if (view.current.points.length > 0) {
    games.push({
      gameNumber: view.current.gameNumber,
      won: countsFor(view.current.points, "won"),
      lost: countsFor(view.current.points, "lost"),
    });
  }

  return {
    games,
    overall: {
      won: countsFor(view.history, "won"),
      lost: countsFor(view.history, "lost"),
    },
  };
}

function countsFor(
  points: readonly { outcome: PointOutcome; category: string }[],
  outcome: PointOutcome,
): CategoryCount[] {
  const total = points.filter((point) => point.outcome === outcome).length;

  return POINT_CATEGORIES.filter((item) => item.outcome === outcome).map((item) => {
    const count = points.filter(
      (point) => point.outcome === outcome && point.category === item.category,
    ).length;

    return {
      category: item.category,
      count,
      share: total === 0 ? 0 : count / total,
    };
  });
}
