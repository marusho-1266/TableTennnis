import type { Match } from "../../domain/match/types";
import type { MatchRepository } from "../../storage/matchRepository";
import { CategorySheet } from "./CategorySheet";
import { GameEndOverlay } from "./GameEndOverlay";
import { MatchReview } from "./MatchReview";
import { ScoringScreen } from "./ScoringScreen";
import { useMatchPersistence } from "./useMatchPersistence";
import { useScoringInput } from "./useScoringInput";

export interface ScoringSessionProps {
  playerName: string;
  opponentName: string;
  tapGuardMs?: number;
  initialMatch?: Match | null;
  repository?: MatchRepository;
  onViewResults?: (match: Match) => void;
}

export function ScoringSession({
  playerName,
  opponentName,
  tapGuardMs,
  initialMatch,
  repository,
  onViewResults,
}: ScoringSessionProps) {
  const scoring = useScoringInput({
    tapGuardMs,
    initialPoints: initialMatch?.points,
  });
  const persistence = useMatchPersistence({
    playerName,
    opponentName,
    initialMatch,
    points: scoring.points,
    history: scoring.view.history,
    matchOver: scoring.view.matchOver,
    repository,
  });
  const lastCompletedGame = scoring.view.games.at(-1);
  const overlay = lastCompletedGame
    ? scoring.showMatchEnd
      ? {
          kicker: "試合終了",
          title: scoring.view.gamesWon.player === 3 ? "勝利" : "敗戦",
          score: `${scoring.view.gamesWon.player} – ${scoring.view.gamesWon.opponent}`,
          note: `${playerName} 対 ${opponentName} ゲーム取得数 ${scoring.view.gamesWon.player}–${scoring.view.gamesWon.opponent}`,
          primaryLabel: "試合結果を見る",
          onPrimary: () => onViewResults?.(persistence.snapshot),
        }
      : scoring.showGameEnd
        ? {
            kicker: `第${lastCompletedGame.gameNumber}ゲーム終了`,
            title: `${lastCompletedGame.winner === "player" ? playerName : opponentName} のゲーム`,
            score: `${lastCompletedGame.playerScore} – ${lastCompletedGame.opponentScore}`,
            note: `ゲーム取得数 ${scoring.view.gamesWon.player}–${scoring.view.gamesWon.opponent}。3ゲーム先取で試合終了。`,
            primaryLabel: "次のゲームへ",
            onPrimary: scoring.acknowledgeGameEnd,
          }
        : null
    : null;

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
      inputLocked={scoring.showGameEnd || scoring.showMatchEnd}
      saveError={persistence.saveError}
      onRetrySave={persistence.retrySave}
      onWon={scoring.pickWon}
      onLost={scoring.pickLost}
      onUndo={scoring.undo}
      onOpenHistory={scoring.openHistory}
    >
      {overlay ? (
        <GameEndOverlay
          kicker={overlay.kicker}
          title={overlay.title}
          score={overlay.score}
          note={overlay.note}
          gameLines={scoring.view.games.map((game) => ({
            label: `第${game.gameNumber}ゲーム`,
            score: `${game.playerScore} – ${game.opponentScore}${game.winner === "player" ? "　◦ 獲得" : ""}`,
          }))}
          primaryLabel={overlay.primaryLabel}
          onPrimary={overlay.onPrimary ?? (() => undefined)}
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
