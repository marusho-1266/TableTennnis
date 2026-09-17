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
      gameNumber={1}
      playerScore={0}
      opponentScore={0}
      gamesWonPlayer={0}
      gamesWonOpponent={0}
      deuce={false}
      recent={[]}
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
