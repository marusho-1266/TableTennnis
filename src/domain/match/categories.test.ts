import { POINT_CATEGORIES, tapCountFor } from "./categories";

describe("point categories", () => {
  it("defines every winning category from the spec", () => {
    const won = POINT_CATEGORIES.filter((item) => item.outcome === "won").map(
      (item) => item.category,
    );

    expect(won).toEqual(["サーブ", "3球目", "ラリー（5球目以降）", "レシーブ", "相手ミス"]);
  });

  it("defines every losing category from the spec", () => {
    const lost = POINT_CATEGORIES.filter((item) => item.outcome === "lost").map(
      (item) => item.category,
    );

    expect(lost).toEqual(["サーブミス", "レシーブミス", "3球目ミス", "ラリー", "相手決定打"]);
  });

  it("uses バックハンド rather than バックドライブ", () => {
    const labels = POINT_CATEGORIES.flatMap((item) => [item.category, ...(item.details ?? [])]);

    expect(labels).toContain("バックハンド");
    expect(labels).not.toContain("バックドライブ");
  });

  it("records rally categories on the second tap and others on the third", () => {
    expect(tapCountFor("won", "ラリー（5球目以降）")).toBe(2);
    expect(tapCountFor("lost", "ラリー")).toBe(2);
    expect(tapCountFor("won", "サーブ")).toBe(3);
    expect(tapCountFor("lost", "サーブミス")).toBe(3);
  });

  it("lists the specified details for each three-tap category", () => {
    expect(details("won", "サーブ")).toEqual(["エース", "相手レシーブミス"]);
    expect(details("won", "3球目")).toEqual([
      "フォアドライブ",
      "フォアドライブ回り込み",
      "バックハンド",
      "スマッシュ",
      "その他",
    ]);
    expect(details("won", "レシーブ")).toEqual([
      "フォアドライブ",
      "バックハンド",
      "相手ミス",
      "その他",
    ]);
    expect(details("won", "相手ミス")).toEqual([
      "サーブミス",
      "レシーブミス",
      "攻撃ミス",
      "その他",
    ]);
    expect(details("lost", "サーブミス")).toEqual(["ネット", "オーバー", "空振り", "その他"]);
    expect(details("lost", "レシーブミス")).toEqual(["ネット", "オーバー", "空振り", "その他"]);
    expect(details("lost", "3球目ミス")).toEqual([
      "フォアドライブネット",
      "フォアドライブオーバー",
      "バックハンドミス",
      "空振り",
      "その他",
    ]);
    expect(details("lost", "相手決定打")).toEqual(["レシーブ浮いた", "その他"]);
  });
});

function details(outcome: "won" | "lost", category: string) {
  return (
    POINT_CATEGORIES.find((item) => item.outcome === outcome && item.category === category)
      ?.details ?? null
  );
}
