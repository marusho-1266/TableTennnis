import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("renders the live scoring screen", async () => {
    render(<App />);

    expect(await screen.findByText("第1ゲーム")).toBeTruthy();
    expect(screen.getByRole("button", { name: "得点" })).toBeTruthy();
  });
});
