import { expect, type Page } from "@playwright/test";

export async function startMatch(page: Page, player = "本田 悠真", opponent = "佐々木 蓮") {
  await page.getByLabel("記録対象選手名").fill(player);
  await page.getByLabel("対戦相手名").fill(opponent);
  await page.getByRole("button", { name: "試合開始" }).click();
  await expect(page.getByRole("button", { name: "得点" })).toBeVisible();
}

export async function winPoint(page: Page) {
  const playerScore = page.locator(".scoreboard-score").first();
  const previous = (await playerScore.textContent()) ?? "";
  await page.getByRole("button", { name: "得点" }).click();
  await page.getByRole("button", { name: /ラリー（5球目以降）/ }).click();
  await page.waitForTimeout(300);
  await expect(playerScore).not.toHaveText(previous);
}

export async function losePoint(page: Page) {
  const opponentScore = page.locator(".scoreboard-score").nth(1);
  const previous = (await opponentScore.textContent()) ?? "";
  await page.getByRole("button", { name: "失点" }).click();
  await page.getByRole("button", { name: "ラリー 確定" }).click();
  await page.waitForTimeout(300);
  await expect(opponentScore).not.toHaveText(previous);
}

export async function winGame(page: Page) {
  for (let index = 0; index < 11; index += 1) {
    await winPoint(page);
  }
}
