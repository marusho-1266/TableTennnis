import { POINT_CATEGORIES } from "./categories";
import { deriveMatch, type PointInput } from "./derive";
import type { PointOutcome } from "./types";

export interface CategoryCount {
  category: string;
  count: number;
  share: number;
}

export interface DetailCount {
  category: string;
  detail: string | null;
  count: number;
  share: number;
}

export interface GameStats {
  gameNumber: number;
  won: DetailCount[];
  lost: DetailCount[];
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
    won: detailCountsFor(game.points, "won"),
    lost: detailCountsFor(game.points, "lost"),
  }));

  if (view.current.points.length > 0) {
    games.push({
      gameNumber: view.current.gameNumber,
      won: detailCountsFor(view.current.points, "won"),
      lost: detailCountsFor(view.current.points, "lost"),
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

function detailCountsFor(
  points: readonly { outcome: PointOutcome; category: string; detail: string | null }[],
  outcome: PointOutcome,
): DetailCount[] {
  const matched = points.filter((point) => point.outcome === outcome);
  const total = matched.length;
  const shareOf = (count: number) => (total === 0 ? 0 : count / total);
  const rows: DetailCount[] = [];

  for (const definition of POINT_CATEGORIES.filter((item) => item.outcome === outcome)) {
    const inCategory = matched.filter((point) => point.category === definition.category);
    if (!definition.details) {
      rows.push({
        category: definition.category,
        detail: null,
        count: inCategory.length,
        share: shareOf(inCategory.length),
      });
      continue;
    }

    const known = new Set(definition.details);
    for (const detail of definition.details) {
      const count = inCategory.filter((point) => point.detail === detail).length;
      rows.push({
        category: definition.category,
        detail,
        count,
        share: shareOf(count),
      });
    }

    const leftovers = new Map<string | null, number>();
    for (const point of inCategory) {
      if (point.detail !== null && known.has(point.detail)) {
        continue;
      }
      leftovers.set(point.detail, (leftovers.get(point.detail) ?? 0) + 1);
    }
    for (const [detail, count] of leftovers) {
      rows.push({
        category: definition.category,
        detail,
        count,
        share: shareOf(count),
      });
    }
  }

  return rows;
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
