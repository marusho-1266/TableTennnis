import { FormEvent, useState } from "react";
import { ResumeMatchBanner } from "./ResumeMatchBanner";

export interface MatchSetupScreenProps {
  onStart: (playerName: string, opponentName: string) => void;
  onResume?: () => void;
  onOpenHistory?: () => void;
  inProgressMatch?: {
    playerName: string;
    opponentName: string;
  } | null;
}

export function MatchSetupScreen({
  onStart,
  onResume,
  onOpenHistory,
  inProgressMatch,
}: MatchSetupScreenProps) {
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const trimmedPlayer = playerName.trim();
  const trimmedOpponent = opponentName.trim();
  const canStart = trimmedPlayer.length > 0 && trimmedOpponent.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) {
      return;
    }
    if (inProgressMatch) {
      setConfirming(true);
      return;
    }
    onStart(trimmedPlayer, trimmedOpponent);
  }

  return (
    <main className="scoring-screen">
      <header className="scoring-header">
        <h1>試合開始</h1>
      </header>
      {inProgressMatch && onResume ? (
        <ResumeMatchBanner
          playerName={inProgressMatch.playerName}
          opponentName={inProgressMatch.opponentName}
          onResume={onResume}
        />
      ) : null}
      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="player-name">記録対象選手名</label>
          <input
            id="player-name"
            className="input"
            value={playerName}
            autoComplete="off"
            onChange={(event) => setPlayerName(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="opponent-name">対戦相手名</label>
          <input
            id="opponent-name"
            className="input"
            value={opponentName}
            autoComplete="off"
            onChange={(event) => setOpponentName(event.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={!canStart}>
          試合開始
        </button>
      </form>
      {onOpenHistory ? (
        <button type="button" className="btn btn-secondary btn-block" onClick={onOpenHistory}>
          過去の試合
        </button>
      ) : null}
      <p className="data-notice">
        記録はこの端末内に保存されます。ブラウザのデータを消すと復元できません。
      </p>
      {confirming ? (
        <div className="dialog-backdrop">
          <div className="dialog" role="dialog" aria-modal="true" aria-label="新しい試合の確認">
            <p>進行中の試合があります。新しい試合を始めますか？</p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                setConfirming(false);
                onStart(trimmedPlayer, trimmedOpponent);
              }}
            >
              新しい試合を始める
            </button>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setConfirming(false)}>
              キャンセル
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
