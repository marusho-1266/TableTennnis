import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchSetupScreen } from "./MatchSetupScreen";

describe("MatchSetupScreen", () => {
  it("does not start while either name is blank after trimming", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<MatchSetupScreen onStart={onStart} />);

    expect((screen.getByRole("button", { name: "試合開始" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    await user.type(screen.getByLabelText("記録対象選手名"), "   ");
    await user.type(screen.getByLabelText("対戦相手名"), "佐々木 蓮");
    expect((screen.getByRole("button", { name: "試合開始" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    await user.click(screen.getByRole("button", { name: "試合開始" }));
    expect(onStart).not.toHaveBeenCalled();
  });

  it("starts the match with trimmed names and outlined controls", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<MatchSetupScreen onStart={onStart} />);

    await user.type(screen.getByLabelText("記録対象選手名"), " 本田 悠真 ");
    await user.type(screen.getByLabelText("対戦相手名"), " 佐々木 蓮 ");
    await user.click(screen.getByRole("button", { name: "試合開始" }));

    expect(onStart).toHaveBeenCalledWith("本田 悠真", "佐々木 蓮");
    expect(screen.getByLabelText("記録対象選手名").className).toContain("input");
    expect(screen.getByRole("button", { name: "試合開始" }).className).toContain("btn-primary");
  });
});
