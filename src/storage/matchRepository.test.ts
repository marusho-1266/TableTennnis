import "fake-indexeddb/auto";
import type { Match } from "../domain/match/types";
import { DB_NAME, MATCH_STORE, openMatchDb } from "./db";
import { SCHEMA_VERSION, createMatchRepository } from "./matchRepository";

const sampleMatch: Match = {
  id: "match-1",
  playerName: "本田 悠真",
  opponentName: "佐々木 蓮",
  startedAt: "2026-09-17T13:00:00.000Z",
  completedAt: null,
  status: "in_progress",
  points: [
    {
      id: "p1",
      sequence: 1,
      gameNumber: 1,
      outcome: "won",
      category: "ラリー（5球目以降）",
      detail: null,
      scoreAfter: { player: 1, opponent: 0 },
      recordedAt: "2026-09-17T13:00:01.000Z",
    },
  ],
};

describe("matchRepository", () => {
  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  });

  it("saves and loads a match by id", async () => {
    const repository = await createMatchRepository();

    await repository.save(sampleMatch);

    expect(await repository.getById("match-1")).toEqual(sampleMatch);
  });

  it("exposes a numbered schema version", () => {
    expect(SCHEMA_VERSION).toBe(1);
  });

  it("does not return invalid stored records", async () => {
    const db = await openMatchDb();
    await db.put(MATCH_STORE, { id: "bad", playerName: 12, points: "nope" });
    db.close();

    const repository = await createMatchRepository();

    expect(await repository.getById("bad")).toBeNull();
    expect(await repository.getById("missing")).toBeNull();
  });

  it("lists completed matches newest first and omits in-progress ones", async () => {
    const repository = await createMatchRepository();
    await repository.save(sampleMatch);
    await repository.save({
      ...sampleMatch,
      id: "older",
      status: "completed",
      startedAt: "2026-09-16T13:00:00.000Z",
      completedAt: "2026-09-16T14:00:00.000Z",
    });
    await repository.save({
      ...sampleMatch,
      id: "newer",
      status: "completed",
      startedAt: "2026-09-17T15:00:00.000Z",
      completedAt: "2026-09-17T16:00:00.000Z",
    });

    const listed = await repository.listCompleted();
    expect(listed.map((match) => match.id)).toEqual(["newer", "older"]);
  });
});
