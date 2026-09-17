import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScoringSession } from "./ScoringSession";
import { useScoringInput } from "./useScoringInput";

describe("game end acknowledgement", () => {
  it("shows a pending game-end after 11-0 and starts the next game at 0-0", () => {
    const { result } = renderHook(() => useScoringInput({ tapGuardMs: 0, now: incrementingNow() }));

    winGameFor(result, "player");

    expect(result.current.showGameEnd).toBe(true);
    expect(result.current.view.games[0]).toMatchObject({
      gameNumber: 1,
      playerScore: 11,
      opponentScore: 0,
      winner: "player",
    });
    expect(result.current.view.current).toMatchObject({
      gameNumber: 2,
      playerScore: 0,
      opponentScore: 0,
    });

    act(() => result.current.acknowledgeGameEnd());

    expect(result.current.showGameEnd).toBe(false);
    expect(result.current.view.current.gameNumber).toBe(2);
    expect(result.current.view.current.playerScore).toBe(0);
  });

  it("waits through deuce and then shows the overlay at 12-10", () => {
    const { result } = renderHook(() => useScoringInput({ tapGuardMs: 0, now: incrementingNow() }));

    for (let index = 0; index < 10; index += 1) {
      act(() => result.current.pickWon());
      act(() => result.current.selectCategory("ラリー（5球目以降）"));
      act(() => result.current.pickLost());
      act(() => result.current.selectCategory("ラリー"));
    }

    expect(result.current.showGameEnd).toBe(false);
    expect(result.current.view.deuce).toBe(true);

    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));
    expect(result.current.showGameEnd).toBe(false);

    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));

    expect(result.current.showGameEnd).toBe(true);
    expect(result.current.view.games[0]).toMatchObject({
      playerScore: 12,
      opponentScore: 10,
      winner: "player",
    });
  });

  it("cancels the finished game when the overlay undoes the last point", () => {
    const { result } = renderHook(() => useScoringInput({ tapGuardMs: 0, now: incrementingNow() }));

    winGameFor(result, "player");
    act(() => result.current.undo());

    expect(result.current.showGameEnd).toBe(false);
    expect(result.current.view.current.gameNumber).toBe(1);
    expect(result.current.view.current.playerScore).toBe(10);
  });

  it("can undo back into the previous game after the next game has started", () => {
    const { result } = renderHook(() => useScoringInput({ tapGuardMs: 0, now: incrementingNow() }));

    winGameFor(result, "player");
    act(() => result.current.acknowledgeGameEnd());
    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));
    act(() => result.current.undo());
    act(() => result.current.undo());

    expect(result.current.view.current.gameNumber).toBe(1);
    expect(result.current.view.gamesWon.player).toBe(0);
    expect(result.current.showGameEnd).toBe(false);
  });

  it("shows the overlay copy and starts the next game from the primary button", async () => {
    const user = userEvent.setup();
    render(<ScoringSession playerName="本田 悠真" opponentName="佐々木 蓮" tapGuardMs={0} />);

    await winGameOnScreen(user, "player");

    const overlay = screen.getByRole("dialog", { name: "第1ゲーム終了" });
    expect(within(overlay).getByText("本田 悠真 のゲーム")).toBeTruthy();
    expect(within(overlay).getByText("11 – 0")).toBeTruthy();
    expect(within(overlay).getByRole("button", { name: "次のゲームへ" })).toBeTruthy();
    expect((screen.getByRole("button", { name: "得点" }) as HTMLButtonElement).disabled).toBe(true);

    await user.click(within(overlay).getByRole("button", { name: "次のゲームへ" }));

    expect(screen.queryByRole("dialog", { name: "第1ゲーム終了" })).toBeNull();
    expect(screen.getByText("第2ゲーム")).toBeTruthy();
    expect((screen.getByRole("button", { name: "得点" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("undoes the finished game from the overlay", async () => {
    const user = userEvent.setup();
    render(<ScoringSession playerName="本田 悠真" opponentName="佐々木 蓮" tapGuardMs={0} />);

    await winGameOnScreen(user, "player");
    const overlay = screen.getByRole("dialog", { name: "第1ゲーム終了" });
    await user.click(within(overlay).getByRole("button", { name: "1点戻す" }));

    expect(screen.queryByRole("dialog", { name: "第1ゲーム終了" })).toBeNull();
    expect(screen.getByText("第1ゲーム")).toBeTruthy();
  });
});

function incrementingNow() {
  let current = 0;
  return () => {
    current += 1;
    return current;
  };
}

function winGameFor(
  result: { current: ReturnType<typeof useScoringInput> },
  winner: "player" | "opponent",
) {
  for (let index = 0; index < 11; index += 1) {
    act(() => (winner === "player" ? result.current.pickWon() : result.current.pickLost()));
    act(() =>
      result.current.selectCategory(winner === "player" ? "ラリー（5球目以降）" : "ラリー"),
    );
  }
}

async function winGameOnScreen(
  user: { click: (element: HTMLElement) => Promise<void> },
  winner: "player" | "opponent",
) {
  const outcome = winner === "player" ? "得点" : "失点";
  const category = winner === "player" ? /ラリー（5球目以降）/ : /^ラリー/;

  for (let index = 0; index < 11; index += 1) {
    await user.click(screen.getByRole("button", { name: outcome }));
    await user.click(screen.getByRole("button", { name: category }));
  }
}
