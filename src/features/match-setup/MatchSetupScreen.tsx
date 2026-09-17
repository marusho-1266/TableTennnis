import { FormEvent, useState } from "react";

export interface MatchSetupScreenProps {
  onStart: (playerName: string, opponentName: string) => void;
}

export function MatchSetupScreen({ onStart }: MatchSetupScreenProps) {
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const trimmedPlayer = playerName.trim();
  const trimmedOpponent = opponentName.trim();
  const canStart = trimmedPlayer.length > 0 && trimmedOpponent.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canStart) {
      return;
    }
    onStart(trimmedPlayer, trimmedOpponent);
  }

  return (
    <main className="scoring-screen">
      <header className="scoring-header">
        <h1>試合開始</h1>
      </header>
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
    </main>
  );
}
