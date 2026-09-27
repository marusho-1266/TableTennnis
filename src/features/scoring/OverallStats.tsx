import { deriveMatch, type PointInput } from "../../domain/match/derive";
import { formatPointLine } from "../../domain/match/format";
import { deriveStats } from "../../domain/match/stats";
import { CategoryTable } from "./CategoryTable";

export interface OverallStatsProps {
  points: PointInput[];
  onClose: () => void;
}

export function OverallStats({ points, onClose }: OverallStatsProps) {
  const stats = deriveStats(points);
  const history = [...deriveMatch(points).history].reverse().map(formatPointLine);

  return (
    <div className="match-review overall-stats summary-screen" role="dialog" aria-modal="true" aria-label="全体集計">
      <header className="scoring-header">
        <h1>全体集計</h1>
      </header>
      <div className="review-list">
        <CategoryTable title="得点" items={stats.overall.won} />
        <CategoryTable title="失点" items={stats.overall.lost} />
        <section className="summary-block" aria-label="ポイント履歴">
          <h2>ポイント履歴</h2>
          <p className="review-caption">新しい順・読み取り専用</p>
          {history.map((item) => (
            <div className="review-line" key={`${item.head}-${item.body}`}>
              <span className="point-head review-head">{item.head}</span>
              <span className="point-mark">{item.mark}</span>
              <span>{item.body}</span>
            </div>
          ))}
        </section>
      </div>
      <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
        閉じて試合へ戻る
      </button>
    </div>
  );
}
