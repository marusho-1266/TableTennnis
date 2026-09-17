import type { DerivedPoint } from "./derive";

export function formatPointLine(point: DerivedPoint) {
  const mark = point.outcome === "won" ? "＋" : "−";
  const body = [point.outcome === "won" ? "得点" : "失点", point.category, point.detail]
    .filter(Boolean)
    .join(" → ");

  return {
    head: `G${point.gameNumber} ${point.scoreAfter.player}-${point.scoreAfter.opponent}`,
    mark,
    body,
  };
}
