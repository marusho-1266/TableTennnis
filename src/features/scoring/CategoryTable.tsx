import { formatSharePercent } from "../../domain/match/format";
import type { CategoryCount } from "../../domain/match/stats";

export function CategoryTable({ title, items }: { title: string; items: CategoryCount[] }) {
  return (
    <div className="summary-table">
      <h2>{title}</h2>
      <div className="game-end-game-line summary-stat-line summary-stat-header">
        <span />
        <span className="summary-count">ポイント数</span>
        <span className="summary-share">構成比</span>
      </div>
      {items.map((item) => (
        <div className="game-end-game-line summary-stat-line" key={`${title}-${item.category}`}>
          <span>{item.category}</span>
          <span className="summary-count">{item.count}</span>
          <span className="summary-share">{formatSharePercent(item.share)}</span>
        </div>
      ))}
    </div>
  );
}
