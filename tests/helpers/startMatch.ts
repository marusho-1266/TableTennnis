import { screen } from "@testing-library/react";

export async function startMatch(
  user: { type: (element: HTMLElement, text: string) => Promise<void>; click: (element: HTMLElement) => Promise<void> },
  playerName = "本田 悠真",
  opponentName = "佐々木 蓮",
) {
  await user.type(await screen.findByLabelText("記録対象選手名"), playerName);
  await user.type(screen.getByLabelText("対戦相手名"), opponentName);
  await user.click(screen.getByRole("button", { name: "試合開始" }));
  await screen.findByRole("button", { name: "得点" });
}
