import { deriveMatch } from "../../domain/match/derive";
import type { Match } from "../../domain/match/types";

export interface MatchHistoryScreenProps {
  matches: Match[];
  onSelect: (match: Match) => void;
  onBack?: () => void;
}

export function MatchHistoryScreen({ matches, onSelect, onBack }: MatchHistoryScreenProps) {
  return (
    <main className="scoring-screen">
      <header className="scoring-header">
        <h1>過去の試合</h1>
      </header>
      {matches.length === 0 ? (
        <p className="recent-empty">まだ完了した試合はありません。</p>
      ) : (
        <div className="history-list">
          {[...matches]
            .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
            .map((match) => {
            const view = deriveMatch(match.points);
            const result = view.gamesWon.player === 3 ? "勝利" : "敗戦";
            return (
              <button
                type="button"
                className="history-item"
                key={match.id}
                onClick={() => onSelect(match)}
              >
                <span className="history-date">
                  {new Date(match.startedAt).toLocaleString("ja-JP")}
                </span>
                <span>
                  {match.playerName} 対 {match.opponentName}
                </span>
                <span>
                  {result} {view.gamesWon.player}–{view.gamesWon.opponent}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {onBack ? (
        <button type="button" className="btn btn-secondary btn-block" onClick={onBack}>
          戻る
        </button>
      ) : null}
    </main>
  );
}
