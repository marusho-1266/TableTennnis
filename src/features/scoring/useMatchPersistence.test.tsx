import { renderHook, waitFor } from "@testing-library/react";
import type { Match } from "../../domain/match/types";
import type { MatchRepository } from "../../storage/matchRepository";
import { useMatchPersistence } from "./useMatchPersistence";

describe("useMatchPersistence", () => {
  it("stores a three-game finish without marking it as a manual end", async () => {
    const saved: Match[] = [];
    const repository = fakeRepository(saved);

    renderHook(() =>
      useMatchPersistence({
        playerName: "本田 悠真",
        opponentName: "佐々木 蓮",
        points: [point("p1")],
        history: [point("p1")],
        matchOver: true,
        manualEnd: false,
        repository,
      }),
    );

    await waitFor(() => {
      expect(saved[0]).toMatchObject({ status: "completed", manualEnd: false });
    });
  });

  it("stores an early finish as a completed manual end", async () => {
    const saved: Match[] = [];
    const repository = fakeRepository(saved);

    renderHook(() =>
      useMatchPersistence({
        playerName: "本田 悠真",
        opponentName: "佐々木 蓮",
        points: [point("p1")],
        history: [point("p1")],
        matchOver: true,
        manualEnd: true,
        repository,
      }),
    );

    await waitFor(() => {
      expect(saved.at(-1)).toMatchObject({ status: "completed", manualEnd: true });
    });
  });
});

function point(id: string) {
  return {
    id,
    outcome: "won" as const,
    category: "ラリー（5球目以降）",
    detail: null,
    sequence: 1,
    gameNumber: 1,
    scoreAfter: { player: 1, opponent: 0 },
    recordedAt: "2026-09-27T04:00:00.000Z",
  };
}

function fakeRepository(saved: Match[]): MatchRepository {
  return {
    async save(match) {
      saved.push(match);
    },
    async getById() {
      return null;
    },
    async getInProgress() {
      return null;
    },
    async listCompleted() {
      return [];
    },
  };
}
