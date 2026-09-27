import { useState } from "react";
import { matchOutcome } from "../../domain/match/result";
import type { Match } from "../../domain/match/types";
import type { MatchRepository } from "../../storage/matchRepository";
import { CategorySheet } from "./CategorySheet";
import { GameEndOverlay } from "./GameEndOverlay";
import { OverallStats } from "./OverallStats";
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
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [manualEnd, setManualEnd] = useState(false);
  const [overallOpen, setOverallOpen] = useState(false);
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
  const outcome = matchOutcome(scoring.view.gamesWon.player, scoring.view.gamesWon.opponent);
  const gameScore = `${scoring.view.gamesWon.player} – ${scoring.view.gamesWon.opponent}`;

  async function viewResults() {
    if (!manualEnd) {
      onViewResults?.(persistence.snapshot);
      return;
    }

    const match: Match = {
      ...persistence.snapshot,
      status: "completed",
      manualEnd: true,
      completedAt: new Date().toISOString(),
    };
    await repository?.save(match);
    onViewResults?.(match);
  }

  const overlay = manualEnd
    ? {
        kicker: "試合終了",
        title: outcome,
        score: gameScore,
        note: `${playerName} 対 ${opponentName} ゲーム取得数 ${scoring.view.gamesWon.player}–${scoring.view.gamesWon.opponent}`,
        primaryLabel: "試合結果を見る",
        secondaryLabel: "試合に戻る",
        onPrimary: () => void viewResults(),
        onSecondary: () => setManualEnd(false),
        onEndMatch: undefined,
        onShowOverall: undefined,
      }
    : lastCompletedGame
      ? scoring.showMatchEnd
        ? {
            kicker: "試合終了",
            title: outcome,
            score: gameScore,
            note: `${playerName} 対 ${opponentName} ゲーム取得数 ${scoring.view.gamesWon.player}–${scoring.view.gamesWon.opponent}`,
            primaryLabel: "試合結果を見る",
            secondaryLabel: "1点戻す",
            onPrimary: () => void viewResults(),
            onSecondary: scoring.undo,
            onEndMatch: undefined,
            onShowOverall: undefined,
          }
        : scoring.showGameEnd
          ? {
              kicker: `第${lastCompletedGame.gameNumber}ゲーム終了`,
              title: `${lastCompletedGame.winner === "player" ? playerName : opponentName} のゲーム`,
              score: `${lastCompletedGame.playerScore} – ${lastCompletedGame.opponentScore}`,
              note: `ゲーム取得数 ${scoring.view.gamesWon.player}–${scoring.view.gamesWon.opponent}。3ゲーム先取で試合終了。`,
              primaryLabel: "次のゲームへ",
              secondaryLabel: "1点戻す",
              onPrimary: scoring.acknowledgeGameEnd,
              onSecondary: scoring.undo,
              onEndMatch: () => setConfirmEnd(true),
              onShowOverall: () => setOverallOpen(true),
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
      inputLocked={scoring.showGameEnd || scoring.showMatchEnd || manualEnd}
      saveError={persistence.saveError}
      onRetrySave={persistence.retrySave}
      onWon={scoring.pickWon}
      onLost={scoring.pickLost}
      onUndo={scoring.undo}
      onOpenHistory={scoring.openHistory}
      onEndMatch={
        scoring.view.matchOver || scoring.showGameEnd || manualEnd
          ? undefined
          : () => setConfirmEnd(true)
      }
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
          secondaryLabel={overlay.secondaryLabel}
          onPrimary={overlay.onPrimary}
          onUndo={overlay.onSecondary}
          onEndMatch={overlay.onEndMatch}
          onShowOverall={overlay.onShowOverall}
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
      {confirmEnd ? (
        <div className="dialog-backdrop">
          <div className="dialog" role="dialog" aria-modal="true" aria-label="試合終了の確認">
            <p>この試合を終了します。ゲーム取得数は現在のまま保存されます。</p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                setConfirmEnd(false);
                setManualEnd(true);
              }}
            >
              試合を終了する
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => setConfirmEnd(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : null}
      {overallOpen ? (
        <OverallStats points={scoring.points} onClose={() => setOverallOpen(false)} />
      ) : null}
      {scoring.historyOpen ? (
        <MatchReview
          gameNumber={scoring.view.current.gameNumber}
          playerScore={scoring.view.current.playerScore}
          opponentScore={scoring.view.current.opponentScore}
          points={scoring.points}
          items={scoring.historyItems}
          noPoints={scoring.points.length === 0}
          onClose={scoring.closeHistory}
        />
      ) : null}
    </ScoringScreen>
  );
}
