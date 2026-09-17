export interface ResumeMatchBannerProps {
  playerName: string;
  opponentName: string;
  onResume: () => void;
}

export function ResumeMatchBanner({ playerName, opponentName, onResume }: ResumeMatchBannerProps) {
  return (
    <section className="resume-banner" aria-label="進行中の試合">
      <p className="resume-kicker">進行中の試合</p>
      <p className="resume-names">
        {playerName} 対 {opponentName}
      </p>
      <button type="button" className="btn btn-primary btn-block" onClick={onResume}>
        試合を再開
      </button>
    </section>
  );
}
