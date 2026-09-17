import { render, screen } from "@testing-library/react";
import { App } from "./App";

describe("App", () => {
  it("renders the app title", () => {
    render(<App />);

    expect(screen.getByRole("main").textContent).toBe("卓球試合記録");
  });
});
