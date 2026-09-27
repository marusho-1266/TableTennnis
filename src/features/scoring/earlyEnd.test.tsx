import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Match } from "../../domain/match/types";
import type { MatchRepository } from "../../storage/matchRepository";
import { ScoringSession } from "./ScoringSession";

describe("early match end", () => {
  it("leaves the recorded point in place when ending is cancelled", async () => {
    const user = userEvent.setup();
    const saved: Match[] = [];
    render(<ScoringSession tapGuardMs={0} repository={fakeRepository(saved)} {...names} />);

    await user.click(screen.getByRole("button", { name: "得点" }));
    await user.click(screen.getByRole("button", { name: /ラリー（5球目以降）/ }));
    await user.click(screen.getByRole("button", { name: "試合を終了" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("dialog", { name: "試合終了の確認" })).toBeNull();
    expect(screen.getByText("G1 1-0")).toBeTruthy();
    expect(saved.some((match) => match.status === "completed")).toBe(false);
  });

  it("returns from an early finish without deleting points, then saves a win", async () => {
    const user = userEvent.setup();
    const saved: Match[] = [];
    const onViewResults = vi.fn();
    render(
      <ScoringSession
        tapGuardMs={0}
        initialMatch={oneGameMatch()}
        repository={fakeRepository(saved)}
        onViewResults={onViewResults}
        {...names}
      />,
    );

    await user.click(screen.getByRole("button", { name: "試合を終了" }));
    await user.click(screen.getByRole("button", { name: "試合を終了する" }));
    expect(screen.getByRole("dialog", { name: "試合終了" })).toBeTruthy();
    expect(screen.getByText("勝利")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "試合に戻る" }));
    expect(screen.queryByRole("dialog", { name: "試合終了" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "第1ゲーム終了" })).toBeTruthy();
    expect(screen.getByText("11 – 0")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "試合を終了" }));
    await user.click(screen.getByRole("button", { name: "試合を終了する" }));
    await user.click(screen.getByRole("button", { name: "試合結果を見る" }));

    await waitFor(() => {
      expect(onViewResults).toHaveBeenCalledWith(
        expect.objectContaining({ status: "completed", manualEnd: true }),
      );
    });
    expect(saved.at(-1)).toMatchObject({ status: "completed", manualEnd: true });
    expect(saved.at(-1)?.points).toHaveLength(11);
  });

  it("saves a scoreless match as a draw", async () => {
    const user = userEvent.setup();
    const onViewResults = vi.fn();
    render(<ScoringSession tapGuardMs={0} onViewResults={onViewResults} {...names} />);

    await user.click(screen.getByRole("button", { name: "試合を終了" }));
    await user.click(screen.getByRole("button", { name: "試合を終了する" }));
    expect(screen.getByText("引き分け")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "試合結果を見る" }));

    await waitFor(() => {
      expect(onViewResults).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          manualEnd: true,
          points: [],
        }),
      );
    });
  });
});

const names = { playerName: "本田 悠真", opponentName: "佐々木 蓮" };

function oneGameMatch(): Match {
  return {
    id: "match-1",
    ...names,
    startedAt: "2026-09-27T04:00:00.000Z",
    completedAt: null,
    status: "in_progress",
    manualEnd: false,
    points: Array.from({ length: 11 }, (_, index) => ({
      id: `p${index + 1}`,
      sequence: index + 1,
      gameNumber: 1,
      outcome: "won" as const,
      category: "ラリー（5球目以降）",
      detail: null,
      scoreAfter: { player: index + 1, opponent: 0 },
      recordedAt: "2026-09-27T04:00:00.000Z",
    })),
  };
}

function fakeRepository(saved: Match[]): MatchRepository {
  return {
    async save(match) {
      saved.push(match);
    },
    async getById() {
      return null;
    },
    async getInProgress() {
      return null;
    },
    async listCompleted() {
      return [];
    },
  };
}
