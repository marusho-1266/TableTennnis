import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import type { Match } from "../../src/domain/match/types";
import { DB_NAME } from "../../src/storage/db";
import { createMatchRepository } from "../../src/storage/matchRepository";
import { startMatch } from "../helpers/startMatch";

describe("match persistence", () => {
  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  });

  it("saves committed points and restores them after remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App tapGuardMs={0} />);
    await startMatch(user);

    await user.click(await screen.findByRole("button", { name: "得点" }));
    await user.click(screen.getByRole("button", { name: /ラリー（5球目以降）/ }));
    expect(screen.getByText("G1 1-0")).toBeTruthy();

    const stored = await waitFor(async () => {
      const repository = await createMatchRepository();
      const match = await repository.getInProgress();
      expect(match?.points).toHaveLength(1);
      return match as Match;
    });
    expect(stored.points[0]).toMatchObject({
      outcome: "won",
      category: "ラリー（5球目以降）",
      scoreAfter: { player: 1, opponent: 0 },
    });

    unmount();
    render(<App tapGuardMs={0} />);

    await user.click(await screen.findByRole("button", { name: "試合を再開" }));
    expect(await screen.findByText("G1 1-0")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("keeps the restored score after undo", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App tapGuardMs={0} />);
    await startMatch(user);

    await user.click(await screen.findByRole("button", { name: "得点" }));
    await user.click(screen.getByRole("button", { name: /ラリー（5球目以降）/ }));
    await user.click(screen.getByRole("button", { name: "失点" }));
    await user.click(screen.getByRole("button", { name: /^ラリー/ }));
    await user.click(screen.getByRole("button", { name: "1点戻す" }));

    await waitFor(async () => {
      const repository = await createMatchRepository();
      const match = await repository.getInProgress();
      expect(match?.points).toHaveLength(1);
    });

    unmount();
    render(<App tapGuardMs={0} />);

    await user.click(await screen.findByRole("button", { name: "試合を再開" }));
    expect(await screen.findByText("G1 1-0")).toBeTruthy();
    expect(screen.queryByText("G1 1-1")).toBeNull();
  });

  it("shows a retryable notice when save fails", async () => {
    const user = userEvent.setup();
    const repository = {
      save: async () => {
        throw new Error("quota");
      },
      getById: async () => null,
      getInProgress: async () => null,
      listCompleted: async () => [],
    };

    render(<App tapGuardMs={0} repository={repository} />);
    await startMatch(user);

    await user.click(await screen.findByRole("button", { name: "得点" }));
    await user.click(screen.getByRole("button", { name: /ラリー（5球目以降）/ }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("保存に失敗しました。")).toBeTruthy();
    expect(screen.getByRole("button", { name: "再試行" })).toBeTruthy();
  });
});
