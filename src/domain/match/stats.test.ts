import { deriveStats } from "./stats";
import type { PointInput } from "./derive";

describe("deriveStats", () => {
  it("returns zero counts and 0% shares when there are no points", () => {
    const stats = deriveStats([]);

    expect(stats.games).toEqual([]);
    expect(stats.overall.won).toHaveLength(5);
    expect(stats.overall.lost).toHaveLength(5);
    expect(stats.overall.won.every((item) => item.count === 0 && item.share === 0)).toBe(true);
    expect(stats.overall.lost.every((item) => item.count === 0 && item.share === 0)).toBe(true);
  });

  it("counts every category per game and overall", () => {
    const points: PointInput[] = [
      point("won", "ラリー（5球目以降）"),
      point("won", "ラリー（5球目以降）"),
      point("won", "サーブ"),
      point("lost", "ラリー"),
    ];

    const stats = deriveStats(points);
    const game1 = stats.games[0];
    const rallyWon = game1?.won.find((item) => item.category === "ラリー（5球目以降）");
    const serveWon = game1?.won.find((item) => item.category === "サーブ");
    const lostRally = game1?.lost.find((item) => item.category === "ラリー");
    const unusedLost = game1?.lost.find((item) => item.category === "サーブミス");

    expect(stats.games).toHaveLength(1);
    expect(rallyWon).toMatchObject({ count: 2, share: 2 / 3 });
    expect(serveWon).toMatchObject({ count: 1, share: 1 / 3 });
    expect(lostRally).toMatchObject({ count: 1, share: 1 });
    expect(unusedLost).toMatchObject({ count: 0, share: 0 });
    expect(stats.overall.won.find((item) => item.category === "3球目")).toMatchObject({
      count: 0,
      share: 0,
    });
  });
});

function point(outcome: PointInput["outcome"], category: string): PointInput {
  return { id: `${outcome}-${category}-${Math.random()}`, outcome, category, detail: null };
}
