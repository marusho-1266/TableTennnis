import { useEffect, useState } from "react";
import { MatchHistoryScreen } from "../features/match-history/MatchHistoryScreen";
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
  const [screen, setScreen] = useState<"setup" | "scoring" | "summary" | "history">("setup");
  const [ready, setReady] = useState(false);
  const [initialMatch, setInitialMatch] = useState<Match | null>(null);
  const [inProgressMatch, setInProgressMatch] = useState<Match | null>(null);
  const [completedMatch, setCompletedMatch] = useState<Match | null>(null);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [summarySource, setSummarySource] = useState<"live" | "history">("live");
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
      setInProgressMatch(match);
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

  if (screen === "summary" && completedMatch) {
    return (
      <MatchSummaryScreen
        match={completedMatch}
        onBack={() => setScreen(summarySource === "history" ? "history" : "setup")}
      />
    );
  }

  if (screen === "history") {
    return (
      <MatchHistoryScreen
        matches={completedMatches}
        onSelect={(match) => {
          setCompletedMatch(match);
          setSummarySource("history");
          setScreen("summary");
        }}
        onBack={() => setScreen("setup")}
      />
    );
  }

  if (screen === "setup" || !initialMatch) {
    return (
      <MatchSetupScreen
        inProgressMatch={inProgressMatch}
        onResume={() => {
          if (!inProgressMatch) {
            return;
          }
          setInitialMatch(inProgressMatch);
          setScreen("scoring");
        }}
        onStart={(playerName, opponentName) => {
          setInitialMatch({
            id: crypto.randomUUID(),
            playerName,
            opponentName,
            startedAt: new Date().toISOString(),
            completedAt: null,
            status: "in_progress",
            manualEnd: false,
            points: [],
          });
          setScreen("scoring");
        }}
        onOpenHistory={() => {
          void resolvedRepository.listCompleted().then((matches) => {
            setCompletedMatches(matches);
            setScreen("history");
          });
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
      onViewResults={(match) => {
        setCompletedMatch(match);
        setSummarySource("live");
        setScreen("summary");
      }}
    />
  );
}
