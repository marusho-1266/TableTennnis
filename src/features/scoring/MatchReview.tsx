import type { PointInput } from "../../domain/match/derive";
import { deriveStats } from "../../domain/match/stats";
import { CategoryTable } from "./CategoryTable";
import type { PointLineView } from "./ScoringScreen";

export interface MatchReviewProps {
  gameNumber: number;
  playerScore: number;
  opponentScore: number;
  points: PointInput[];
  items: PointLineView[];
  noPoints: boolean;
  onClose: () => void;
}

export function MatchReview({
  gameNumber,
  playerScore,
  opponentScore,
  points,
  items,
  noPoints,
  onClose,
}: MatchReviewProps) {
  const stats = deriveStats(points);

  return (
    <div className="match-review summary-screen" role="dialog" aria-modal="true" aria-label="試合の確認">
      <header className="scoring-header">
        <h1>試合の確認</h1>
        <p className="scoring-kicker">
          第{gameNumber}ゲーム {playerScore}–{opponentScore}
        </p>
      </header>
      <div className="review-list">
        <section className="summary-block" aria-label="全体集計">
          <h2>全体集計</h2>
          <CategoryTable title="得点" items={stats.overall.won} />
          <CategoryTable title="失点" items={stats.overall.lost} />
        </section>
        <p className="review-caption">新しい順・読み取り専用</p>
        {items.map((item) => (
          <div className="review-line" key={`${item.head}-${item.body}`}>
            <span className="point-head review-head">{item.head}</span>
            <span className="point-mark">{item.mark}</span>
            <span>{item.body}</span>
          </div>
        ))}
        {noPoints ? <div className="recent-empty">記録されたポイントはまだありません。</div> : null}
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
        閉じて試合へ戻る
      </button>
    </div>
  );
}
