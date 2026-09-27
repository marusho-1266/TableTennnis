import type { Match, Point, PointOutcome } from "../domain/match/types";
import { MATCH_STORE, SCHEMA_VERSION, openMatchDb } from "./db";

export { SCHEMA_VERSION };

export interface MatchRepository {
  save(match: Match): Promise<void>;
  getById(id: string): Promise<Match | null>;
  getInProgress(): Promise<Match | null>;
  listCompleted(): Promise<Match[]>;
}

export async function createMatchRepository(): Promise<MatchRepository> {
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
        return readMatch(record);
      } finally {
        database.close();
      }
    },
    async getInProgress(): Promise<Match | null> {
      const database = await openMatchDb();
      try {
        const records = await database.getAll(MATCH_STORE);
        return (
          records
            .map(readMatch)
            .filter((match) => match !== null)
            .filter((match) => match.status === "in_progress")
            .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0] ?? null
        );
      } finally {
        database.close();
      }
    },
    async listCompleted(): Promise<Match[]> {
      const database = await openMatchDb();
      try {
        const records = await database.getAll(MATCH_STORE);
        return records
          .map(readMatch)
          .filter((match) => match !== null)
          .filter((match) => match.status === "completed")
          .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
      } finally {
        database.close();
      }
    },
  };
}

function readMatch(value: unknown): Match | null {
  if (!isStoredMatch(value)) {
    return null;
  }

  return { ...value, manualEnd: value.manualEnd === true };
}

function isStoredMatch(value: unknown): value is Omit<Match, "manualEnd"> & { manualEnd?: boolean } {
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
    (value.manualEnd === undefined || typeof value.manualEnd === "boolean") &&
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
