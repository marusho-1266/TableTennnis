import { formatPointLine } from "./format";
import type { DerivedPoint } from "./derive";

describe("formatPointLine", () => {
  it("renders the live history line used on the scoring screen", () => {
    const point: DerivedPoint = {
      id: "1",
      outcome: "won",
      category: "サーブ",
      detail: "エース",
      sequence: 1,
      gameNumber: 1,
      scoreAfter: { player: 1, opponent: 0 },
    };

    expect(formatPointLine(point)).toEqual({
      head: "G1 1-0",
      mark: "＋",
      body: "得点 → サーブ → エース",
    });
  });
});
