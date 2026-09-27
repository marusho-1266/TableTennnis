import { deriveMatch } from "../../domain/match/derive";
import { formatPointLine, formatSharePercent } from "../../domain/match/format";
import { deriveStats, type CategoryCount } from "../../domain/match/stats";
import type { Match } from "../../domain/match/types";

export interface MatchSummaryScreenProps {
  match: Match;
  onBack?: () => void;
}

export function MatchSummaryScreen({ match, onBack }: MatchSummaryScreenProps) {
  const view = deriveMatch(match.points);
  const stats = deriveStats(match.points);
  const result = view.gamesWon.player === 3 ? "勝利" : "敗戦";
  const playedAt = new Date(match.startedAt).toLocaleString("ja-JP");

  return (
    <main className="scoring-screen summary-screen">
      <header className="scoring-header">
        <h1>試合結果</h1>
        <p className="scoring-kicker">
          {view.gamesWon.player}–{view.gamesWon.opponent}
        </p>
      </header>

      <section className="summary-block" aria-label="試合結果">
        <p className="game-end-title">{result}</p>
        <p>
          <span>{match.playerName}</span> 対 <span>{match.opponentName}</span>
        </p>
        <p>{playedAt}</p>
        <p>
          ゲーム取得数 {view.gamesWon.player}–{view.gamesWon.opponent}
        </p>
        <div className="game-end-games">
          {view.games.map((game) => (
            <div className="game-end-game-line" key={game.gameNumber}>
              <span>第{game.gameNumber}ゲーム</span>
              <span>
                {game.playerScore} – {game.opponentScore}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="summary-block">
        <h2>ゲーム別集計</h2>
        {stats.games.map((game) => (
          <div key={game.gameNumber} className="summary-game-stats">
            <h3>第{game.gameNumber}ゲーム</h3>
            <CategoryTable title="得点" items={game.won} showShare />
            <CategoryTable title="失点" items={game.lost} showShare />
          </div>
        ))}
      </section>

      <section className="summary-block">
        <h2>全体集計</h2>
        <CategoryTable title="得点" items={stats.overall.won} showShare />
        <CategoryTable title="失点" items={stats.overall.lost} showShare />
      </section>

      <section className="summary-block">
        <h2>ポイント履歴</h2>
        {view.history.map((point) => {
          const line = formatPointLine(point);
          return (
            <div className="point-line" key={point.id}>
              <span className="point-head">{line.head}</span>
              <span className="point-mark">{line.mark}</span>
              <span>{line.body}</span>
            </div>
          );
        })}
      </section>

      {onBack ? (
        <button type="button" className="btn btn-primary btn-block" onClick={onBack}>
          戻る
        </button>
      ) : null}
    </main>
  );
}

function rowClass(showShare: boolean, header = false) {
  return [
    "game-end-game-line",
    showShare ? "summary-stat-line" : "summary-count-line",
    header ? "summary-stat-header" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function CategoryTable({
  title,
  items,
  showShare = false,
}: {
  title: string;
  items: CategoryCount[];
  showShare?: boolean;
}) {
  return (
    <div className="summary-table">
      <h3>{title}</h3>
      <div className={rowClass(showShare, true)}>
        <span />
        <span className="summary-count">ポイント数</span>
        {showShare ? <span className="summary-share">構成比</span> : null}
      </div>
      {items.map((item) => (
        <div className={rowClass(showShare)} key={`${title}-${item.category}`}>
          <span>{item.category}</span>
          <span className="summary-count">{item.count}</span>
          {showShare ? <span className="summary-share">{formatSharePercent(item.share)}</span> : null}
        </div>
      ))}
    </div>
  );
}
