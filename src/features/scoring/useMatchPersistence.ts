import { useEffect, useState } from "react";
import type { DerivedPoint, PointInput } from "../../domain/match/derive";
import type { Match, Point } from "../../domain/match/types";
import type { MatchRepository } from "../../storage/matchRepository";

export interface UseMatchPersistenceOptions {
  playerName: string;
  opponentName: string;
  initialMatch?: Match | null;
  points: PointInput[];
  history: DerivedPoint[];
  matchOver: boolean;
  repository?: MatchRepository;
}

export function useMatchPersistence({
  playerName,
  opponentName,
  initialMatch,
  points,
  history,
  matchOver,
  repository,
}: UseMatchPersistenceOptions) {
  const [matchId] = useState(() => initialMatch?.id ?? crypto.randomUUID());
  const [startedAt] = useState(() => initialMatch?.startedAt ?? new Date().toISOString());
  const [hasSaved, setHasSaved] = useState(() => Boolean(initialMatch));
  const [saveError, setSaveError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!repository || (points.length === 0 && !hasSaved)) {
      return;
    }

    const activeRepository = repository;
    let cancelled = false;

    async function persist() {
      try {
        await activeRepository.save({
          id: matchId,
          playerName,
          opponentName,
          startedAt,
          completedAt: matchOver ? new Date().toISOString() : null,
          status: matchOver ? "completed" : "in_progress",
          points: toStoredPoints(history),
        });
        if (!cancelled) {
          setHasSaved(true);
          setSaveError(false);
        }
      } catch {
        if (!cancelled) {
          setSaveError(true);
        }
      }
    }

    void persist();
    return () => {
      cancelled = true;
    };
  }, [
    hasSaved,
    history,
    matchId,
    matchOver,
    opponentName,
    playerName,
    points,
    repository,
    retryCount,
    startedAt,
  ]);

  return {
    saveError,
    retrySave: () => setRetryCount((count) => count + 1),
  };
}

function toStoredPoints(history: DerivedPoint[]): Point[] {
  return history.map((point) => ({
    id: point.id,
    sequence: point.sequence,
    gameNumber: point.gameNumber,
    outcome: point.outcome,
    category: point.category,
    detail: point.detail,
    scoreAfter: point.scoreAfter,
    recordedAt: point.recordedAt ?? new Date().toISOString(),
  }));
}
