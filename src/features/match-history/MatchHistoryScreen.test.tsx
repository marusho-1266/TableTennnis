import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Match } from "../../domain/match/types";
import { MatchHistoryScreen } from "./MatchHistoryScreen";

describe("MatchHistoryScreen", () => {
  it("lists completed matches newest first and reopens the same summary", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const older = completedMatch("older", "2026-09-16T13:00:00.000Z", "山田", "佐藤");
    const newer = completedMatch("newer", "2026-09-17T15:00:00.000Z", "本田 悠真", "佐々木 蓮");

    render(<MatchHistoryScreen matches={[older, newer]} onSelect={onSelect} />);

    const items = screen.getAllByRole("button");
    expect(items[0]?.textContent).toContain("本田 悠真");
    expect(items[1]?.textContent).toContain("山田");
    expect(items[0]?.textContent).toContain("勝利");
    expect(items[0]?.textContent).toContain("3–0");

    await user.click(screen.getByRole("button", { name: /本田 悠真/ }));
    expect(onSelect).toHaveBeenCalledWith(newer);
  });
});

function completedMatch(
  id: string,
  startedAt: string,
  playerName: string,
  opponentName: string,
): Match {
  return {
    id,
    playerName,
    opponentName,
    startedAt,
    completedAt: startedAt,
    status: "completed",
    points: Array.from({ length: 33 }, (_, index) => ({
      id: `${id}-${index}`,
      sequence: index + 1,
      gameNumber: Math.floor(index / 11) + 1,
      outcome: "won",
      category: "ラリー（5球目以降）",
      detail: null,
      scoreAfter: { player: (index % 11) + 1, opponent: 0 },
      recordedAt: startedAt,
    })),
  };
}
