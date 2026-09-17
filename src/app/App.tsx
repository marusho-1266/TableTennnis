import { ScoringScreen } from "../features/scoring/ScoringScreen";

export function App() {
  return (
    <ScoringScreen
      playerName="本田 悠真"
      opponentName="佐々木 蓮"
      gameNumber={1}
      playerScore={0}
      opponentScore={0}
      gamesWonPlayer={0}
      gamesWonOpponent={0}
      deuce={false}
      recent={[]}
      noPoints
      undoDisabled
      onWon={() => undefined}
      onLost={() => undefined}
      onUndo={() => undefined}
      onOpenHistory={() => undefined}
    />
  );
}
