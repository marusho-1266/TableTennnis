import { act, render, renderHook, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../app/App";
import { ScoringSession } from "./ScoringSession";
import { useScoringInput } from "./useScoringInput";
import { startMatch } from "../../../tests/helpers/startMatch";

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

  it("shows overall counts and shares without leaving the finished game", async () => {
    const user = userEvent.setup();
    render(<ScoringSession playerName="本田 悠真" opponentName="佐々木 蓮" tapGuardMs={0} />);

    await winGameOnScreen(user, "player");
    const overlay = screen.getByRole("dialog", { name: "第1ゲーム終了" });
    await user.click(within(overlay).getByRole("button", { name: "全体集計" }));

    const stats = screen.getByRole("dialog", { name: "全体集計" });
    expect(within(stats).getAllByText("ポイント数").length).toBeGreaterThan(0);
    expect(within(stats).getAllByText("構成比").length).toBeGreaterThan(0);
    expect(within(stats).getByText("11")).toBeTruthy();
    expect(within(stats).getAllByText("100.0%").length).toBeGreaterThan(0);
    expect(within(stats).getAllByText("0.0%").length).toBeGreaterThan(0);
    const history = within(stats).getByRole("region", { name: "ポイント履歴" });
    expect(within(history).getByText("新しい順・読み取り専用")).toBeTruthy();
    expect(within(history).getByText("G1 11-0")).toBeTruthy();
    expect(within(history).getByText("G1 1-0")).toBeTruthy();

    await user.click(within(stats).getByRole("button", { name: "閉じて試合へ戻る" }));

    expect(screen.queryByRole("dialog", { name: "全体集計" })).toBeNull();
    const returned = screen.getByRole("dialog", { name: "第1ゲーム終了" });
    expect(within(returned).getByText("11 – 0")).toBeTruthy();
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

describe("match end overlay", () => {
  it("shows the match-end overlay after three games and returns to play on undo", () => {
    const { result } = renderHook(() => useScoringInput({ tapGuardMs: 0, now: incrementingNow() }));

    winMatchFor(result, "player");

    expect(result.current.showMatchEnd).toBe(true);
    expect(result.current.showGameEnd).toBe(false);
    expect(result.current.view.gamesWon).toEqual({ player: 3, opponent: 0 });

    act(() => result.current.undo());

    expect(result.current.showMatchEnd).toBe(false);
    expect(result.current.view.matchOver).toBe(false);
    expect(result.current.view.current.gameNumber).toBe(3);
    expect(result.current.view.current.playerScore).toBe(10);
  });

  it("opens the results placeholder from 試合結果を見る and never offers a new match", async () => {
    const user = userEvent.setup();
    render(<App tapGuardMs={0} />);
    await startMatch(user);

    await winMatchOnScreen(user, "player");

    const overlay = screen.getByRole("dialog", { name: "試合終了" });
    expect(within(overlay).getByText("勝利")).toBeTruthy();
    expect(within(overlay).getByText("3 – 0")).toBeTruthy();
    expect(within(overlay).getByRole("button", { name: "試合結果を見る" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "新しい試合を始める" })).toBeNull();
    expect(screen.queryByRole("button", { name: "次のゲームへ" })).toBeNull();

    await user.click(within(overlay).getByRole("button", { name: "試合結果を見る" }));

    expect(screen.getByRole("heading", { name: "試合結果" })).toBeTruthy();
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

function winMatchFor(
  result: { current: ReturnType<typeof useScoringInput> },
  winner: "player" | "opponent",
) {
  for (let game = 0; game < 3; game += 1) {
    winGameFor(result, winner);
    if (game < 2) {
      act(() => result.current.acknowledgeGameEnd());
    }
  }
}

async function winGameOnScreen(
  user: { click: (element: HTMLElement) => Promise<void> },
  winner: "player" | "opponent",
) {
  const outcome = winner === "player" ? "得点" : "失点";
  const category = winner === "player" ? /ラリー（5球目以降）/ : /^ラリー/;

  for (let index = 0; index < 11; index += 1) {
    await user.click(await screen.findByRole("button", { name: outcome }));
    await user.click(screen.getByRole("button", { name: category }));
  }
}

async function winMatchOnScreen(
  user: { click: (element: HTMLElement) => Promise<void> },
  winner: "player" | "opponent",
) {
  for (let game = 0; game < 3; game += 1) {
    await winGameOnScreen(user, winner);
    if (game < 2) {
      await user.click(screen.getByRole("button", { name: "次のゲームへ" }));
    }
  }
}
