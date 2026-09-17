import { expect, test } from "@playwright/test";
import { startMatch, winGame } from "./helpers";

test("starts a match, takes three games, and opens results", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await startMatch(page);

  await winGame(page);
  await page.getByRole("button", { name: "次のゲームへ" }).click();
  await winGame(page);
  await page.getByRole("button", { name: "次のゲームへ" }).click();
  await winGame(page);

  await expect(page.getByRole("dialog", { name: "試合終了" })).toBeVisible();
  await expect(page.getByRole("button", { name: "新しい試合を始める" })).toHaveCount(0);
  await page.getByRole("button", { name: "試合結果を見る" }).click();
  await expect(page.getByRole("heading", { name: "試合結果" })).toBeVisible();
  await expect(page.getByText("勝利")).toBeVisible();
});
