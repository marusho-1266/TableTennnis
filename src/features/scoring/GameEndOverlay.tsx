export interface GameLineView {
  label: string;
  score: string;
}

export interface GameEndOverlayProps {
  kicker: string;
  title: string;
  score: string;
  note: string;
  gameLines: GameLineView[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onUndo: () => void;
  onEndMatch?: () => void;
}

export function GameEndOverlay({
  kicker,
  title,
  score,
  note,
  gameLines,
  primaryLabel,
  onPrimary,
  secondaryLabel = "1点戻す",
  onUndo,
  onEndMatch,
}: GameEndOverlayProps) {
  return (
    <div className="game-end-overlay" role="dialog" aria-modal="true" aria-label={kicker}>
      <div className="game-end-dialog">
        <div className="game-end-kicker">{kicker}</div>
        <div className="game-end-title">{title}</div>
        <div className="game-end-score">{score}</div>
        <div className="game-end-note">{note}</div>
        <div className="game-end-games">
          {gameLines.map((line) => (
            <div className="game-end-game-line" key={line.label}>
              <span>{line.label}</span>
              <span>{line.score}</span>
            </div>
          ))}
        </div>
        <div className="game-end-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={onPrimary}>
            {primaryLabel}
          </button>
          {onEndMatch ? (
            <button type="button" className="btn btn-secondary btn-block" onClick={onEndMatch}>
              試合を終了
            </button>
          ) : null}
          <button type="button" className="btn btn-secondary btn-block" onClick={onUndo}>
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
