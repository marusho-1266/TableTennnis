import { expect, test } from "@playwright/test";
import { losePoint, startMatch, winPoint } from "./helpers";

test("finishes a deuce game and undoes across the game boundary", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await startMatch(page);

  for (let index = 0; index < 10; index += 1) {
    await winPoint(page);
    await losePoint(page);
  }
  await expect(page.getByText("2点差まで継続")).toBeVisible();
  await winPoint(page);
  await winPoint(page);
  await expect(page.getByRole("dialog", { name: "第1ゲーム終了" })).toBeVisible();

  await page.getByRole("button", { name: "次のゲームへ" }).click();
  await winPoint(page);
  await page.getByRole("button", { name: "1点戻す" }).click();
  await page.getByRole("button", { name: "1点戻す" }).click();

  await expect(page.getByRole("heading", { name: "第1ゲーム" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "第1ゲーム終了" })).toHaveCount(0);
});
