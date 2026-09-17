import { render, screen } from "@testing-library/react";
import { MatchSummaryScreen } from "./MatchSummaryScreen";
import type { Match, Point } from "../../domain/match/types";

describe("MatchSummaryScreen", () => {
  it("shows result, per-game counts, overall shares, and chronological history", () => {
    render(<MatchSummaryScreen match={sampleMatch()} />);

    expect(screen.getByRole("heading", { name: "試合結果" })).toBeTruthy();
    expect(screen.getByText("勝利")).toBeTruthy();
    expect(screen.getByText("本田 悠真")).toBeTruthy();
    expect(screen.getByText("佐々木 蓮")).toBeTruthy();
    expect(screen.getByText("3–0")).toBeTruthy();
    expect(screen.getAllByText("第1ゲーム").length).toBeGreaterThan(0);
    expect(screen.getAllByText("11 – 0").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "ゲーム別集計" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "全体集計" })).toBeTruthy();
    expect(screen.getAllByText("ラリー（5球目以降）").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText(/100%/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "ポイント履歴" })).toBeTruthy();
    expect(screen.getByText("G1 1-0")).toBeTruthy();
    expect(screen.getByText("G3 11-0")).toBeTruthy();
    expect(screen.queryByText(/弱点/)).toBeNull();
    expect(screen.queryByText(/練習/)).toBeNull();
    expect(screen.queryByText(/敗因/)).toBeNull();
  });
});

function sampleMatch(): Match {
  const points: Point[] = [];
  for (let game = 1; game <= 3; game += 1) {
    for (let score = 1; score <= 11; score += 1) {
      const sequence = points.length + 1;
      points.push({
        id: `p${sequence}`,
        sequence,
        gameNumber: game,
        outcome: "won",
        category: "ラリー（5球目以降）",
        detail: null,
        scoreAfter: { player: score, opponent: 0 },
        recordedAt: "2026-09-17T13:00:00.000Z",
      });
    }
  }

  return {
    id: "match-1",
    playerName: "本田 悠真",
    opponentName: "佐々木 蓮",
    startedAt: "2026-09-17T13:00:00.000Z",
    completedAt: "2026-09-17T13:20:00.000Z",
    status: "completed",
    points,
  };
}
