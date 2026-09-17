import { useMemo, useRef, useState } from "react";
import { findCategory, POINT_CATEGORIES } from "../../domain/match/categories";
import { deriveMatch, type PointInput } from "../../domain/match/derive";
import { formatPointLine } from "../../domain/match/format";
import type { PointOutcome } from "../../domain/match/types";

export interface SheetState {
  outcome: PointOutcome;
  category: string | null;
}

export interface SheetItem {
  label: string;
  hint: string;
  onClick: () => void;
}

export interface UseScoringInputOptions {
  tapGuardMs?: number;
  now?: () => number;
}

export function useScoringInput(options: UseScoringInputOptions = {}) {
  const tapGuardMs = options.tapGuardMs ?? 250;
  const now = options.now ?? Date.now;
  const lastCommitAt = useRef<number | null>(null);
  const [points, setPoints] = useState<PointInput[]>([]);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [acknowledgedGames, setAcknowledgedGames] = useState(0);

  function commit(outcome: PointOutcome, category: string, detail: string | null) {
    const timestamp = now();
    if (lastCommitAt.current !== null && timestamp - lastCommitAt.current < tapGuardMs) {
      return;
    }

    lastCommitAt.current = timestamp;
    setPoints((current) => [
      ...current,
      {
        id: `${timestamp}-${current.length}`,
        outcome,
        category,
        detail,
      },
    ]);
    setSheet(null);
  }

  function selectCategory(category: string) {
    if (!sheet) {
      return;
    }

    const definition = findCategory(sheet.outcome, category);
    if (!definition) {
      return;
    }

    if (definition.details) {
      setSheet({ outcome: sheet.outcome, category });
      return;
    }

    commit(sheet.outcome, category, null);
  }

  function selectDetail(detail: string) {
    if (!sheet?.category) {
      return;
    }

    commit(sheet.outcome, sheet.category, detail);
  }

  const bank = sheet ? POINT_CATEGORIES.filter((item) => item.outcome === sheet.outcome) : [];
  const selectedCategory = sheet?.category
    ? findCategory(sheet.outcome, sheet.category)
    : undefined;
  const sheetItems: SheetItem[] = !sheet
    ? []
    : !sheet.category
      ? bank.map((item) => ({
          label: item.category,
          hint: item.details ? "" : "確定",
          onClick: () => selectCategory(item.category),
        }))
      : (selectedCategory?.details ?? []).map((detail) => ({
          label: detail,
          hint: "確定",
          onClick: () => selectDetail(detail),
        }));

  const sheetStepLabel = !sheet ? "" : sheet.category ? "3 / 詳細を選ぶ" : "2 / 大分類を選ぶ";
  const sheetTrail = !sheet
    ? ""
    : sheet.category
      ? `${sheet.outcome === "won" ? "得点" : "失点"} → ${sheet.category}`
      : sheet.outcome === "won"
        ? "得点"
        : "失点";

  const view = useMemo(() => deriveMatch(points), [points]);
  const acknowledged = Math.min(acknowledgedGames, view.games.length);
  const showGameEnd = view.games.length > acknowledged && !view.matchOver;
  const showMatchEnd = view.matchOver;
  const recent = view.recentCurrentGame.map(formatPointLine);

  const historyItems = [...view.history].reverse().map(formatPointLine);

  function pickOutcome(outcome: PointOutcome) {
    if (showGameEnd || showMatchEnd) {
      return;
    }
    setSheet({ outcome, category: null });
  }

  return {
    points,
    view,
    recent,
    historyItems,
    historyOpen,
    sheet,
    sheetItems,
    sheetStepLabel,
    sheetTrail,
    showGameEnd,
    showMatchEnd,
    pickWon: () => pickOutcome("won"),
    pickLost: () => pickOutcome("lost"),
    selectCategory,
    selectDetail,
    sheetBack: () =>
      setSheet((current) =>
        current?.category ? { outcome: current.outcome, category: null } : null,
      ),
    closeSheet: () => setSheet(null),
    openHistory: () => {
      setHistoryOpen(true);
      setSheet(null);
    },
    closeHistory: () => setHistoryOpen(false),
    undo: () => {
      setPoints((current) => current.slice(0, -1));
      setSheet(null);
      lastCommitAt.current = null;
    },
    acknowledgeGameEnd: () => {
      setAcknowledgedGames(view.games.length);
      setSheet(null);
    },
  };
}
