import { useEffect, useState } from "react";
import { MatchSetupScreen } from "../features/match-setup/MatchSetupScreen";
import { MatchSummaryScreen } from "../features/match-summary/MatchSummaryScreen";
import { ScoringSession } from "../features/scoring/ScoringSession";
import type { Match } from "../domain/match/types";
import { createMatchRepository, type MatchRepository } from "../storage/matchRepository";

export interface AppProps {
  tapGuardMs?: number;
  repository?: MatchRepository;
}

export function App({ tapGuardMs, repository }: AppProps = {}) {
  const [screen, setScreen] = useState<"setup" | "scoring" | "summary">("setup");
  const [ready, setReady] = useState(false);
  const [initialMatch, setInitialMatch] = useState<Match | null>(null);
  const [resolvedRepository, setResolvedRepository] = useState<MatchRepository | undefined>(
    repository,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const activeRepository = repository ?? (await createMatchRepository());
      const match = await activeRepository.getInProgress();
      if (cancelled) {
        return;
      }
      setResolvedRepository(activeRepository);
      setInitialMatch(match);
      if (match) {
        setScreen("scoring");
      }
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  if (!ready || !resolvedRepository) {
    return <p>読み込み中</p>;
  }

  if (screen === "summary") {
    return <MatchSummaryScreen />;
  }

  if (screen === "setup" || !initialMatch) {
    return (
      <MatchSetupScreen
        onStart={(playerName, opponentName) => {
          setInitialMatch({
            id: crypto.randomUUID(),
            playerName,
            opponentName,
            startedAt: new Date().toISOString(),
            completedAt: null,
            status: "in_progress",
            points: [],
          });
          setScreen("scoring");
        }}
      />
    );
  }

  return (
    <ScoringSession
      playerName={initialMatch.playerName}
      opponentName={initialMatch.opponentName}
      tapGuardMs={tapGuardMs}
      initialMatch={initialMatch}
      repository={resolvedRepository}
      onViewResults={() => setScreen("summary")}
    />
  );
}
