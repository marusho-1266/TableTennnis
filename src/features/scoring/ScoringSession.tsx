import { CategorySheet } from "./CategorySheet";
import { ScoringScreen } from "./ScoringScreen";
import { useScoringInput } from "./useScoringInput";

export interface ScoringSessionProps {
  playerName: string;
  opponentName: string;
  tapGuardMs?: number;
}

export function ScoringSession({ playerName, opponentName, tapGuardMs }: ScoringSessionProps) {
  const scoring = useScoringInput({ tapGuardMs });

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
      onWon={scoring.pickWon}
      onLost={scoring.pickLost}
      onUndo={() => undefined}
      onOpenHistory={() => undefined}
    >
      {scoring.sheet ? (
        <CategorySheet
          stepLabel={scoring.sheetStepLabel}
          trail={scoring.sheetTrail}
          items={scoring.sheetItems}
          onBack={scoring.sheetBack}
          onClose={scoring.closeSheet}
        />
      ) : null}
    </ScoringScreen>
  );
}
