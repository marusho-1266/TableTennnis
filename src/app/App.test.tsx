import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { startMatch } from "../../tests/helpers/startMatch";
import { App } from "./App";

describe("App", () => {
  it("starts a match from required names onto the live scoreboard", async () => {
    const user = userEvent.setup();
    render(<App tapGuardMs={0} />);

    expect(await screen.findByRole("heading", { name: "試合開始" })).toBeTruthy();
    await startMatch(user);

    expect(screen.getByText("第1ゲーム")).toBeTruthy();
    expect(screen.getByText("本田 悠真")).toBeTruthy();
    expect(screen.getByText("佐々木 蓮")).toBeTruthy();
  });
});
