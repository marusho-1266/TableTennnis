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

  it("counts details within each game and major categories overall", () => {
    const points: PointInput[] = [
      point("won", "ラリー（5球目以降）", null),
      point("won", "ラリー（5球目以降）", null),
      point("won", "サーブ", "エース"),
      point("lost", "ラリー", null),
      point("lost", "サーブミス", "ネット"),
    ];

    const stats = deriveStats(points);
    const game1 = stats.games[0];
    const rallyWon = game1?.won.find((item) => item.category === "ラリー（5球目以降）");
    const ace = game1?.won.find((item) => item.detail === "エース");
    const otherServe = game1?.won.find((item) => item.detail === "相手レシーブミス");
    const lostRally = game1?.lost.find((item) => item.category === "ラリー");
    const net = game1?.lost.find((item) => item.detail === "ネット");
    const unusedLost = game1?.lost.find((item) => item.detail === "オーバー");

    expect(stats.games).toHaveLength(1);
    expect(rallyWon).toMatchObject({ detail: null, count: 2, share: 2 / 3 });
    expect(ace).toMatchObject({ count: 1, share: 1 / 3 });
    expect(otherServe).toMatchObject({ count: 0, share: 0 });
    expect(lostRally).toMatchObject({ detail: null, count: 1, share: 1 / 2 });
    expect(net).toMatchObject({ count: 1, share: 1 / 2 });
    expect(unusedLost).toMatchObject({ count: 0, share: 0 });
    expect(stats.overall.won.find((item) => item.category === "サーブ")).toMatchObject({
      count: 1,
      share: 1 / 3,
    });
    expect(stats.overall.won.find((item) => item.category === "3球目")).toMatchObject({
      count: 0,
      share: 0,
    });
  });
});

function point(
  outcome: PointInput["outcome"],
  category: string,
  detail: string | null,
): PointInput {
  return {
    id: `${outcome}-${category}-${detail ?? "none"}-${Math.random()}`,
    outcome,
    category,
    detail,
  };
}
