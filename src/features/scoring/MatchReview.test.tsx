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
    expect(within(review).getByText("新しい順・読み取り専用")).toBeTruthy();
    expect(within(review).getByText("G1 1-0")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "閉じて試合へ戻る" }));
    expect(screen.queryByRole("dialog", { name: "試合の確認" })).toBeNull();
    expect(screen.getByRole("button", { name: "得点" })).toBeTruthy();
  });
});
