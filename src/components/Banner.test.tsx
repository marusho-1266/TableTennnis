import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Banner } from "./Banner";

describe("Banner", () => {
  it("shows retryable copy", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <Banner actionLabel="再試行" onAction={onAction}>
        保存に失敗しました。
      </Banner>,
    );

    expect(screen.getByRole("alert").textContent).toContain("保存に失敗しました。");
    await user.click(screen.getByRole("button", { name: "再試行" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
