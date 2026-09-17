import { isDeuce, isGameComplete, isMatchComplete } from "./rules";

describe("isGameComplete", () => {
  it("ends a game at 11-0 and 11-9", () => {
    expect(isGameComplete(11, 0)).toBe(true);
    expect(isGameComplete(11, 9)).toBe(true);
    expect(isGameComplete(0, 11)).toBe(true);
  });

  it("continues at 10-10 and 11-10", () => {
    expect(isGameComplete(10, 10)).toBe(false);
    expect(isGameComplete(11, 10)).toBe(false);
    expect(isGameComplete(10, 11)).toBe(false);
  });

  it("ends a deuce game at 12-10 and 15-13", () => {
    expect(isGameComplete(12, 10)).toBe(true);
    expect(isGameComplete(15, 13)).toBe(true);
    expect(isGameComplete(13, 15)).toBe(true);
  });
});

describe("isDeuce", () => {
  it("is true only when both sides have at least 10 points", () => {
    expect(isDeuce(10, 10)).toBe(true);
    expect(isDeuce(11, 10)).toBe(true);
    expect(isDeuce(10, 9)).toBe(false);
    expect(isDeuce(9, 9)).toBe(false);
  });
});

describe("isMatchComplete", () => {
  it("ends the match when either side wins 3 games", () => {
    expect(isMatchComplete(3, 0)).toBe(true);
    expect(isMatchComplete(3, 2)).toBe(true);
    expect(isMatchComplete(2, 3)).toBe(true);
    expect(isMatchComplete(2, 2)).toBe(false);
    expect(isMatchComplete(1, 0)).toBe(false);
  });
});
