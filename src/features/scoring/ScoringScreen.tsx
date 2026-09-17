import type { ReactNode } from "react";
import { Banner } from "../../components/Banner";

export interface PointLineView {
  head: string;
  mark: string;
  body: string;
}

export interface ScoringScreenProps {
  playerName: string;
  opponentName: string;
  gameNumber: number;
  playerScore: number;
  opponentScore: number;
  gamesWonPlayer: number;
  gamesWonOpponent: number;
  deuce: boolean;
  recent: PointLineView[];
  noPoints: boolean;
  undoDisabled: boolean;
  inputLocked?: boolean;
  saveError?: boolean;
  onRetrySave?: () => void;
  onWon: () => void;
  onLost: () => void;
  onUndo: () => void;
  onOpenHistory: () => void;
  children?: ReactNode;
}

export function ScoringScreen({
  playerName,
  opponentName,
  gameNumber,
  playerScore,
  opponentScore,
  gamesWonPlayer,
  gamesWonOpponent,
  deuce,
  recent,
  noPoints,
  undoDisabled,
  inputLocked = false,
  saveError = false,
  onRetrySave,
  onWon,
  onLost,
  onUndo,
  onOpenHistory,
  children,
}: ScoringScreenProps) {
  return (
    <div className="scoring-screen">
      <header className="scoring-header">
        <h1>第{gameNumber}ゲーム</h1>
        <p className="scoring-kicker">
          ゲーム {gamesWonPlayer}–{gamesWonOpponent}
        </p>
      </header>
      {saveError ? (
        <Banner actionLabel="再試行" onAction={onRetrySave}>
          保存に失敗しました。
        </Banner>
      ) : null}

      <section className="scoreboard" aria-label="現在のスコア">
        <div className="scoreboard-side">
          <div className="scoreboard-name">{playerName}</div>
          <div className="scoreboard-score">{playerScore}</div>
          <div className="scoreboard-role">記録対象</div>
        </div>
        <div className="scoreboard-rule" />
        <div className="scoreboard-side">
          <div className="scoreboard-name">{opponentName}</div>
          <div className="scoreboard-score scoreboard-score-opponent">{opponentScore}</div>
          <div className="scoreboard-role">対戦相手</div>
        </div>
      </section>

      {deuce ? <div className="deuce-notice">2点差まで継続</div> : null}

      <section className="recent-points" aria-label="直近のポイント">
        {recent.map((line) => (
          <div className="point-line" key={`${line.head}-${line.body}`}>
            <span className="point-head">{line.head}</span>
            <span className="point-mark">{line.mark}</span>
            <span>{line.body}</span>
          </div>
        ))}
        {noPoints ? <div className="recent-empty">まだ記録がありません。</div> : null}
      </section>

      <div className="scoring-spacer" />

      <div className="outcome-grid">
        <button
          type="button"
          className="outcome-button outcome-won"
          data-outcome="won"
          aria-label="得点"
          disabled={inputLocked}
          onClick={onWon}
        >
          <span className="outcome-mark" aria-hidden="true">
            ＋
          </span>
          <span aria-hidden="true">得点</span>
        </button>
        <button
          type="button"
          className="outcome-button outcome-lost"
          data-outcome="lost"
          aria-label="失点"
          disabled={inputLocked}
          onClick={onLost}
        >
          <span className="outcome-mark" aria-hidden="true">
            −
          </span>
          <span aria-hidden="true">失点</span>
        </button>
      </div>

      <div className="utility-grid">
        <button
          type="button"
          className="btn btn-secondary btn-block"
          disabled={undoDisabled || inputLocked}
          onClick={onUndo}
        >
          1点戻す
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          disabled={inputLocked}
          onClick={onOpenHistory}
        >
          試合の確認
        </button>
      </div>
      {children}
    </div>
  );
}
