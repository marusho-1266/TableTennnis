import { render, screen } from "@testing-library/react";
import { ScoringScreen } from "./ScoringScreen";

const defaults = {
  playerName: "本田 悠真",
  opponentName: "佐々木 蓮",
  gameNumber: 1,
  playerScore: 8,
  opponentScore: 9,
  gamesWonPlayer: 1,
  gamesWonOpponent: 0,
  deuce: false,
  recent: [
    { head: "G1 8-9", mark: "−", body: "失点 → レシーブミス → オーバー" },
    { head: "G1 8-8", mark: "＋", body: "得点 → サーブ → エース" },
  ],
  noPoints: false,
  undoDisabled: false,
  onWon: () => undefined,
  onLost: () => undefined,
  onUndo: () => undefined,
  onOpenHistory: () => undefined,
};

describe("ScoringScreen", () => {
  it("shows the live scoreboard and primary scoring actions", () => {
    render(<ScoringScreen {...defaults} />);

    expect(screen.getByText("第1ゲーム")).toBeTruthy();
    expect(screen.getByText("ゲーム 1–0")).toBeTruthy();
    expect(screen.getByText("本田 悠真")).toBeTruthy();
    expect(screen.getByText("佐々木 蓮")).toBeTruthy();
    expect(screen.getByText("記録対象")).toBeTruthy();
    expect(screen.getByText("対戦相手")).toBeTruthy();
    expect(screen.getByRole("button", { name: "得点" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "失点" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "1点戻す" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "試合の確認" })).toBeTruthy();
    expect(screen.queryByText("9:41")).toBeNull();
  });

  it("distinguishes won and lost actions by mark and border style", () => {
    render(<ScoringScreen {...defaults} />);

    const won = screen.getByRole("button", { name: "得点" });
    const lost = screen.getByRole("button", { name: "失点" });

    expect(won.dataset.outcome).toBe("won");
    expect(lost.dataset.outcome).toBe("lost");
    expect(won.className).toContain("outcome-won");
    expect(lost.className).toContain("outcome-lost");
  });

  it("shows the deuce notice and empty recent-points state", () => {
    render(<ScoringScreen {...defaults} deuce noPoints recent={[]} />);

    expect(screen.getByText("2点差まで継続")).toBeTruthy();
    expect(screen.getByText("まだ記録がありません。")).toBeTruthy();
  });
});
