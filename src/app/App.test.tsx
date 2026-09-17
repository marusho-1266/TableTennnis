import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("renders the live scoring screen", () => {
    render(<App />);

    expect(screen.getByText("第1ゲーム")).toBeTruthy();
    expect(screen.getByRole("button", { name: "得点" })).toBeTruthy();
  });
});
