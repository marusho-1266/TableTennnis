import { matchOutcome } from "./result";

describe("matchOutcome", () => {
  it("gives the game-count lead to that side and treats a tie as a draw", () => {
    expect(matchOutcome(1, 0)).toBe("勝利");
    expect(matchOutcome(0, 1)).toBe("敗戦");
    expect(matchOutcome(1, 1)).toBe("引き分け");
    expect(matchOutcome(0, 0)).toBe("引き分け");
    expect(matchOutcome(3, 1)).toBe("勝利");
  });
});
