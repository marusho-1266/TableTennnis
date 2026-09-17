import type { CategoryDefinition, PointOutcome } from "./types";

export const POINT_CATEGORIES: readonly CategoryDefinition[] = [
  { outcome: "won", category: "サーブ", details: ["エース", "相手レシーブミス"] },
  {
    outcome: "won",
    category: "3球目",
    details: ["フォアドライブ", "フォアドライブ回り込み", "バックハンド", "スマッシュ", "その他"],
  },
  { outcome: "won", category: "ラリー（5球目以降）", details: null },
  {
    outcome: "won",
    category: "レシーブ",
    details: ["フォアドライブ", "バックハンド", "相手ミス", "その他"],
  },
  {
    outcome: "won",
    category: "相手ミス",
    details: ["サーブミス", "レシーブミス", "攻撃ミス", "その他"],
  },
  { outcome: "lost", category: "サーブミス", details: ["ネット", "オーバー", "空振り", "その他"] },
  {
    outcome: "lost",
    category: "レシーブミス",
    details: ["ネット", "オーバー", "空振り", "その他"],
  },
  {
    outcome: "lost",
    category: "3球目ミス",
    details: [
      "フォアドライブネット",
      "フォアドライブオーバー",
      "バックハンドミス",
      "空振り",
      "その他",
    ],
  },
  { outcome: "lost", category: "ラリー", details: null },
  { outcome: "lost", category: "相手決定打", details: ["レシーブ浮いた", "その他"] },
];

export function findCategory(
  outcome: PointOutcome,
  category: string,
): CategoryDefinition | undefined {
  return POINT_CATEGORIES.find((item) => item.outcome === outcome && item.category === category);
}

export function tapCountFor(outcome: PointOutcome, category: string): 2 | 3 {
  const definition = findCategory(outcome, category);

  if (!definition) {
    throw new Error(`Unknown category: ${outcome} ${category}`);
  }

  return definition.details ? 3 : 2;
}
