import { CategorySheet } from "./CategorySheet";
import { GameEndOverlay } from "./GameEndOverlay";
import { MatchReview } from "./MatchReview";
import { ScoringScreen } from "./ScoringScreen";
import { useScoringInput } from "./useScoringInput";

export interface ScoringSessionProps {
  playerName: string;
  opponentName: string;
  tapGuardMs?: number;
}

export function ScoringSession({ playerName, opponentName, tapGuardMs }: ScoringSessionProps) {
  const scoring = useScoringInput({ tapGuardMs });
  const lastCompletedGame = scoring.view.games.at(-1);

  return (
    <ScoringScreen
      playerName={playerName}
      opponentName={opponentName}
      gameNumber={scoring.view.current.gameNumber}
      playerScore={scoring.view.current.playerScore}
      opponentScore={scoring.view.current.opponentScore}
      gamesWonPlayer={scoring.view.gamesWon.player}
      gamesWonOpponent={scoring.view.gamesWon.opponent}
      deuce={scoring.view.deuce}
      recent={scoring.recent}
      noPoints={scoring.points.length === 0}
      undoDisabled={scoring.points.length === 0}
      inputLocked={scoring.showGameEnd}
      onWon={scoring.pickWon}
      onLost={scoring.pickLost}
      onUndo={scoring.undo}
      onOpenHistory={scoring.openHistory}
    >
      {scoring.showGameEnd && lastCompletedGame ? (
        <GameEndOverlay
          kicker={`第${lastCompletedGame.gameNumber}ゲーム終了`}
          title={`${lastCompletedGame.winner === "player" ? playerName : opponentName} のゲーム`}
          score={`${lastCompletedGame.playerScore} – ${lastCompletedGame.opponentScore}`}
          note={`ゲーム取得数 ${scoring.view.gamesWon.player}–${scoring.view.gamesWon.opponent}。3ゲーム先取で試合終了。`}
          gameLines={scoring.view.games.map((game) => ({
            label: `第${game.gameNumber}ゲーム`,
            score: `${game.playerScore} – ${game.opponentScore}${game.winner === "player" ? "　◦ 獲得" : ""}`,
          }))}
          primaryLabel="次のゲームへ"
          onPrimary={scoring.acknowledgeGameEnd}
          onUndo={scoring.undo}
        />
      ) : null}
      {scoring.sheet ? (
        <CategorySheet
          stepLabel={scoring.sheetStepLabel}
          trail={scoring.sheetTrail}
          items={scoring.sheetItems}
          onBack={scoring.sheetBack}
          onClose={scoring.closeSheet}
        />
      ) : null}
      {scoring.historyOpen ? (
        <MatchReview
          gameNumber={scoring.view.current.gameNumber}
          playerScore={scoring.view.current.playerScore}
          opponentScore={scoring.view.current.opponentScore}
          items={scoring.historyItems}
          noPoints={scoring.points.length === 0}
          onClose={scoring.closeHistory}
        />
      ) : null}
    </ScoringScreen>
  );
}
