export type PointOutcome = "won" | "lost";

export type MatchStatus = "in_progress" | "completed";

export interface Match {
  id: string;
  playerName: string;
  opponentName: string;
  startedAt: string;
  completedAt: string | null;
  status: MatchStatus;
  points: Point[];
}

export interface Point {
  id: string;
  sequence: number;
  gameNumber: number;
  outcome: PointOutcome;
  category: string;
  detail: string | null;
  scoreAfter: {
    player: number;
    opponent: number;
  };
  recordedAt: string;
}

export interface CategoryDefinition {
  outcome: PointOutcome;
  category: string;
  details: readonly string[] | null;
}
