import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScoringSession } from "./ScoringSession";

describe("MatchReview", () => {
  it("shows a read-only newest-first history and returns to scoring", async () => {
    const user = userEvent.setup();
    render(<ScoringSession playerName="本田 悠真" opponentName="佐々木 蓮" tapGuardMs={0} />);

    await user.click(screen.getByRole("button", { name: "得点" }));
    await user.click(screen.getByRole("button", { name: /ラリー（5球目以降）/ }));
    await user.click(screen.getByRole("button", { name: "試合の確認" }));

    const review = screen.getByRole("dialog", { name: "試合の確認" });
    const perGame = within(review).getByRole("region", { name: "ゲーム別集計" });
    const overall = within(review).getByRole("region", { name: "全体集計" });
    expect(within(perGame).getByText("第1ゲーム")).toBeTruthy();
    expect(within(perGame).getByText("エース")).toBeTruthy();
    expect(within(perGame).getByText("ラリー（5球目以降）")).toBeTruthy();
    expect(within(overall).queryByText("エース")).toBeNull();
    expect(within(overall).getAllByText("ポイント数").length).toBeGreaterThan(0);
    expect(within(overall).getAllByText("構成比").length).toBeGreaterThan(0);
    expect(within(overall).getByText("1")).toBeTruthy();
    expect(within(overall).getAllByText("100.0%").length).toBeGreaterThan(0);
    expect(within(overall).getAllByText("0.0%").length).toBeGreaterThan(0);
    expect(within(review).getByText("新しい順・読み取り専用")).toBeTruthy();
    expect(within(review).getByText("G1 1-0")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "閉じて試合へ戻る" }));
    expect(screen.queryByRole("dialog", { name: "試合の確認" })).toBeNull();
    expect(screen.getByRole("button", { name: "得点" })).toBeTruthy();
  });
});
