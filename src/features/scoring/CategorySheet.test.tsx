import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScoringSession } from "./ScoringSession";

describe("ScoringSession category sheet", () => {
  it("records a rally after two taps and a serve after three taps", async () => {
    const user = userEvent.setup();
    render(<ScoringSession playerName="本田 悠真" opponentName="佐々木 蓮" tapGuardMs={0} />);

    await user.click(screen.getByRole("button", { name: "得点" }));
    expect(screen.getByText("2 / 大分類を選ぶ")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /ラリー（5球目以降）/ }));
    expect(screen.queryByText("2 / 大分類を選ぶ")).toBeNull();

    await user.click(screen.getByRole("button", { name: "失点" }));
    await user.click(screen.getByRole("button", { name: "サーブミス" }));
    expect(screen.getByText("3 / 詳細を選ぶ")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /ネット/ }));
    expect(screen.queryByRole("dialog", { name: "ポイント分類" })).toBeNull();
  });
});
