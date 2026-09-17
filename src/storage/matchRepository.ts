import type { Match, Point, PointOutcome } from "../domain/match/types";
import { MATCH_STORE, SCHEMA_VERSION, openMatchDb } from "./db";

export { SCHEMA_VERSION };

export async function createMatchRepository() {
  return {
    async save(match: Match) {
      const database = await openMatchDb();
      try {
        await database.put(MATCH_STORE, match);
      } finally {
        database.close();
      }
    },
    async getById(id: string): Promise<Match | null> {
      const database = await openMatchDb();
      try {
        const record = await database.get(MATCH_STORE, id);
        return isMatch(record) ? record : null;
      } finally {
        database.close();
      }
    },
  };
}

function isMatch(value: unknown): value is Match {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.playerName === "string" &&
    typeof value.opponentName === "string" &&
    typeof value.startedAt === "string" &&
    (typeof value.completedAt === "string" || value.completedAt === null) &&
    (value.status === "in_progress" || value.status === "completed") &&
    Array.isArray(value.points) &&
    value.points.every(isPoint)
  );
}

function isPoint(value: unknown): value is Point {
  if (!isRecord(value) || !isRecord(value.scoreAfter)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.sequence === "number" &&
    typeof value.gameNumber === "number" &&
    isOutcome(value.outcome) &&
    typeof value.category === "string" &&
    (typeof value.detail === "string" || value.detail === null) &&
    typeof value.scoreAfter.player === "number" &&
    typeof value.scoreAfter.opponent === "number" &&
    typeof value.recordedAt === "string"
  );
}

function isOutcome(value: unknown): value is PointOutcome {
  return value === "won" || value === "lost";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
