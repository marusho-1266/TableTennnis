import { render, screen, within } from "@testing-library/react";
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
    expect(screen.getAllByText("ポイント数").length).toBeGreaterThan(0);
    expect(screen.getAllByText("構成比").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ラリー（5球目以降）").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("33")).toBeTruthy();
    expect(screen.getAllByText("100.0%").length).toBeGreaterThan(0);
    expect(screen.queryByText(/33100/)).toBeNull();
    expect(screen.getAllByText("0.0%").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "ポイント履歴" })).toBeTruthy();
    expect(screen.getByText("G1 1-0")).toBeTruthy();
    expect(screen.getByText("G3 11-0")).toBeTruthy();
    expect(screen.queryByText(/弱点/)).toBeNull();
    expect(screen.queryByText(/練習/)).toBeNull();
    expect(screen.queryByText(/敗因/)).toBeNull();
  });

  it("shows each game's share from that game alone, including an unfinished game", () => {
    render(<MatchSummaryScreen match={mixedGameMatch()} />);

    const perGame = section("ゲーム別集計");
    const overall = section("全体集計");

    expect(within(perGame).getAllByText("ポイント数").length).toBeGreaterThan(0);
    expect(within(perGame).getAllByText("構成比").length).toBeGreaterThan(0);
    expect(within(perGame).getAllByText("50.0%").length).toBeGreaterThan(0);
    expect(within(perGame).getAllByText("0.0%").length).toBeGreaterThan(0);
    expect(within(perGame).queryByText("92.3%")).toBeNull();
    expect(within(overall).getByText("92.3%")).toBeTruthy();
    expect(within(overall).getByText("7.7%")).toBeTruthy();
  });
});

function section(name: string) {
  const block = screen.getByRole("heading", { name }).closest("section");
  if (!block) {
    throw new Error(`${name} section is missing`);
  }
  return block;
}

function mixedGameMatch(): Match {
  const points: Point[] = [];
  for (let score = 1; score <= 11; score += 1) {
    points.push(point(points.length + 1, "ラリー（5球目以降）", score, 0));
  }
  points.push(point(points.length + 1, "サーブ", 1, 0));
  points.push(point(points.length + 1, "ラリー（5球目以降）", 2, 0));

  return {
    id: "match-mixed",
    playerName: "本田 悠真",
    opponentName: "佐々木 蓮",
    startedAt: "2026-09-17T13:00:00.000Z",
    completedAt: null,
    status: "in_progress",
    manualEnd: false,
    points,
  };
}

function point(sequence: number, category: string, player: number, opponent: number): Point {
  return {
    id: `p${sequence}`,
    sequence,
    gameNumber: 1,
    outcome: "won",
    category,
    detail: null,
    scoreAfter: { player, opponent },
    recordedAt: "2026-09-17T13:00:00.000Z",
  };
}

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
    manualEnd: false,
    points,
  };
}
