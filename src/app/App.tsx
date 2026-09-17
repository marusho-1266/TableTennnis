import { useState } from "react";
import { MatchSummaryScreen } from "../features/match-summary/MatchSummaryScreen";
import { ScoringSession } from "../features/scoring/ScoringSession";

export interface AppProps {
  tapGuardMs?: number;
}

export function App({ tapGuardMs }: AppProps = {}) {
  const [screen, setScreen] = useState<"scoring" | "summary">("scoring");

  if (screen === "summary") {
    return <MatchSummaryScreen />;
  }

  return (
    <ScoringSession
      playerName="本田 悠真"
      opponentName="佐々木 蓮"
      tapGuardMs={tapGuardMs}
      onViewResults={() => setScreen("summary")}
    />
  );
}
