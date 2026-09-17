import { act, renderHook } from "@testing-library/react";
import { useScoringInput } from "./useScoringInput";

describe("useScoringInput", () => {
  it("commits a two-tap rally on the second selection", () => {
    const now = sequence([0, 300]);
    const { result } = renderHook(() => useScoringInput({ now }));

    act(() => result.current.pickWon());
    expect(result.current.sheetStepLabel).toBe("2 / 大分類を選ぶ");
    expect(result.current.sheetTrail).toBe("得点");

    act(() => result.current.selectCategory("ラリー（5球目以降）"));

    expect(result.current.sheet).toBeNull();
    expect(result.current.points).toEqual([
      expect.objectContaining({
        outcome: "won",
        category: "ラリー（5球目以降）",
        detail: null,
      }),
    ]);
  });

  it("commits a three-tap serve on the third selection", () => {
    const now = sequence([0, 300, 600]);
    const { result } = renderHook(() => useScoringInput({ now }));

    act(() => result.current.pickLost());
    act(() => result.current.selectCategory("サーブミス"));
    expect(result.current.sheetStepLabel).toBe("3 / 詳細を選ぶ");
    expect(result.current.sheetTrail).toBe("失点 → サーブミス");

    act(() => result.current.selectDetail("ネット"));

    expect(result.current.points[0]).toMatchObject({
      outcome: "lost",
      category: "サーブミス",
      detail: "ネット",
    });
  });

  it("goes back one sheet level and discards an unfinished selection on close", () => {
    const { result } = renderHook(() => useScoringInput());

    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("サーブ"));
    act(() => result.current.sheetBack());
    expect(result.current.sheet).toEqual({ outcome: "won", category: null });

    act(() => result.current.closeSheet());
    expect(result.current.sheet).toBeNull();
    expect(result.current.points).toEqual([]);
  });

  it("undoes the latest point repeatedly", () => {
    const now = sequence([0, 300, 600]);
    const { result } = renderHook(() => useScoringInput({ now }));

    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));
    act(() => result.current.pickLost());
    act(() => result.current.selectCategory("ラリー"));
    expect(result.current.points).toHaveLength(2);

    act(() => result.current.undo());
    expect(result.current.points).toHaveLength(1);
    expect(result.current.view.current.playerScore).toBe(1);
    expect(result.current.view.current.opponentScore).toBe(0);

    act(() => result.current.undo());
    expect(result.current.points).toHaveLength(0);
    act(() => result.current.undo());
    expect(result.current.points).toHaveLength(0);
  });

  it("ignores a second commit within the tap-guard window", () => {
    const now = sequence([1000, 1100, 2000]);
    const { result } = renderHook(() => useScoringInput({ tapGuardMs: 250, now }));

    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));
    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));

    expect(result.current.points).toHaveLength(1);

    act(() => result.current.pickWon());
    act(() => result.current.selectCategory("ラリー（5球目以降）"));
    expect(result.current.points).toHaveLength(2);
  });
});

function sequence(times: number[]) {
  let index = 0;
  return () => times[Math.min(index++, times.length - 1)] ?? 0;
}
