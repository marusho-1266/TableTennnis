import { expect, test } from "@playwright/test";
import { startMatch, winPoint } from "./helpers";

test("records and browses history while offline after the first load", async ({ page, context }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await context.setOffline(true);

  await page.getByRole("button", { name: "過去の試合" }).click();
  await expect(page.getByText("まだ完了した試合はありません。")).toBeVisible();
  await page.getByRole("button", { name: "戻る" }).click();

  await startMatch(page);
  await winPoint(page);
  await expect(page.getByText("G1 1-0")).toBeVisible();
  await page.waitForTimeout(500);

  await page.reload();
  await page.getByRole("button", { name: "試合を再開" }).click();
  await expect(page.getByText("G1 1-0")).toBeVisible();
});
