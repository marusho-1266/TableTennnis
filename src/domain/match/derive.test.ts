import { deriveMatch } from "./derive";
import type { PointInput } from "./derive";

describe("deriveMatch", () => {
  it("starts at game 1 with a 0-0 score", () => {
    const view = deriveMatch([]);

    expect(view.current.gameNumber).toBe(1);
    expect(view.current.playerScore).toBe(0);
    expect(view.current.opponentScore).toBe(0);
    expect(view.gamesWon.player).toBe(0);
    expect(view.gamesWon.opponent).toBe(0);
    expect(view.matchOver).toBe(false);
  });

  it("recomputes the current score from the point list without using scoreAfter", () => {
    const view = deriveMatch([
      point("won", "サーブ", "エース"),
      point("lost", "レシーブミス", "オーバー"),
      point("won", "3球目", "フォアドライブ"),
    ]);

    expect(view.current.playerScore).toBe(2);
    expect(view.current.opponentScore).toBe(1);
    expect(view.history.map((item) => item.scoreAfter)).toEqual([
      { player: 1, opponent: 0 },
      { player: 1, opponent: 1 },
      { player: 2, opponent: 1 },
    ]);
  });

  it("advances the game number after a completed game", () => {
    const view = deriveMatch(winGame("player"));

    expect(view.games).toHaveLength(1);
    expect(view.games[0]).toMatchObject({
      gameNumber: 1,
      playerScore: 11,
      opponentScore: 0,
      winner: "player",
    });
    expect(view.current.gameNumber).toBe(2);
    expect(view.current.playerScore).toBe(0);
    expect(view.gamesWon.player).toBe(1);
  });

  it("numbers points across games and keeps a full history", () => {
    const view = deriveMatch([...winGame("player"), point("lost", "ラリー", null)]);

    expect(view.history[0]?.gameNumber).toBe(1);
    expect(view.history.at(-1)).toMatchObject({
      gameNumber: 2,
      scoreAfter: { player: 0, opponent: 1 },
    });
  });

  it("returns the current game's latest three points, newest first", () => {
    const view = deriveMatch([
      point("won", "サーブ", "エース"),
      point("won", "3球目", "フォアドライブ"),
      point("lost", "ラリー", null),
      point("won", "レシーブ", "バックハンド"),
    ]);

    expect(view.recentCurrentGame.map((item) => item.scoreAfter)).toEqual([
      { player: 3, opponent: 1 },
      { player: 2, opponent: 1 },
      { player: 2, opponent: 0 },
    ]);
  });

  it("marks deuce when both sides have at least 10 in the current game", () => {
    const almost = Array.from({ length: 10 }, () => [
      point("won", "ラリー", null),
      point("lost", "ラリー", null),
    ]).flat();

    expect(deriveMatch(almost).deuce).toBe(true);
    expect(deriveMatch(almost.slice(0, -1)).deuce).toBe(false);
  });

  it("counts an unfinished game's points without awarding that game", () => {
    const view = deriveMatch([...winGame("player"), point("won", "サーブ", "エース")]);

    expect(view.gamesWon).toEqual({ player: 1, opponent: 0 });
    expect(view.matchOver).toBe(false);
    expect(view.current.points).toHaveLength(1);
    expect(view.current.points[0]?.category).toBe("サーブ");
  });

  it("ends the match when a side wins three games", () => {
    const view = deriveMatch([...winGame("player"), ...winGame("player"), ...winGame("player")]);

    expect(view.gamesWon).toEqual({ player: 3, opponent: 0 });
    expect(view.matchOver).toBe(true);
  });

  it("restores the previous game when the last point of a completed game is removed", () => {
    const completed = winGame("player");
    const afterUndo = deriveMatch(completed.slice(0, -1));

    expect(afterUndo.current.gameNumber).toBe(1);
    expect(afterUndo.current.playerScore).toBe(10);
    expect(afterUndo.gamesWon.player).toBe(0);
    expect(afterUndo.matchOver).toBe(false);
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

function winGame(winner: "player" | "opponent"): PointInput[] {
  return Array.from({ length: 11 }, () =>
    point(winner === "player" ? "won" : "lost", "ラリー", null),
  );
}
