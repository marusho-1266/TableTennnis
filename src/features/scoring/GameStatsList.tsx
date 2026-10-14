import { formatSharePercent } from "../../domain/match/format";
import type { DetailCount, GameStats } from "../../domain/match/stats";

export function GameStatsList({ games }: { games: GameStats[] }) {
  return (
    <>
      {games.map((game) => (
        <div key={game.gameNumber} className="summary-game-stats">
          <h3>第{game.gameNumber}ゲーム</h3>
          <DetailTable title="得点" items={game.won} />
          <DetailTable title="失点" items={game.lost} />
        </div>
      ))}
    </>
  );
}

function DetailTable({ title, items }: { title: string; items: DetailCount[] }) {
  return (
    <div className="summary-table">
      <h3>{title}</h3>
      <div className="game-end-game-line summary-stat-line summary-stat-header">
        <span />
        <span className="summary-count">ポイント数</span>
        <span className="summary-share">構成比</span>
      </div>
      {groupDetails(items).map((group) =>
        group.plain ? (
          <StatRow
            key={group.category}
            label={group.category}
            count={group.rows[0]?.count ?? 0}
            share={group.rows[0]?.share ?? 0}
          />
        ) : (
          <div key={group.category}>
            <div className="summary-category-label">{group.category}</div>
            {group.rows.map((row) => (
              <StatRow
                key={`${group.category}-${row.detail ?? "none"}`}
                label={row.detail ?? "詳細なし"}
                count={row.count}
                share={row.share}
                detail
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

function StatRow({
  label,
  count,
  share,
  detail = false,
}: {
  label: string;
  count: number;
  share: number;
  detail?: boolean;
}) {
  return (
    <div className="game-end-game-line summary-stat-line">
      <span className={detail ? "summary-detail-name" : undefined}>{label}</span>
      <span className="summary-count">{count}</span>
      <span className="summary-share">{formatSharePercent(share)}</span>
    </div>
  );
}

function groupDetails(items: DetailCount[]) {
  const groups: { category: string; rows: DetailCount[]; plain: boolean }[] = [];

  for (const item of items) {
    const current = groups.at(-1);
    if (!current || current.category !== item.category) {
      groups.push({ category: item.category, rows: [item], plain: item.detail === null });
      continue;
    }
    current.rows.push(item);
    current.plain = false;
  }

  return groups;
}
