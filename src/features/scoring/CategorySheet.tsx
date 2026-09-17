import type { SheetItem } from "./useScoringInput";

export interface CategorySheetProps {
  stepLabel: string;
  trail: string;
  items: SheetItem[];
  onBack: () => void;
  onClose: () => void;
}

export function CategorySheet({ stepLabel, trail, items, onBack, onClose }: CategorySheetProps) {
  return (
    <div className="category-sheet" role="dialog" aria-modal="true" aria-label="ポイント分類">
      <button type="button" className="sheet-backdrop" aria-label="閉じる" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <button type="button" className="sheet-back" onClick={onBack}>
            戻る
          </button>
          <div>
            <div className="sheet-step">{stepLabel}</div>
            <div className="sheet-trail">{trail}</div>
          </div>
        </div>
        <div className="sheet-items">
          {items.map((item) => (
            <button type="button" className="sheet-item" key={item.label} onClick={item.onClick}>
              <span>{item.label}</span>
              {item.hint ? <span className="sheet-hint">{item.hint}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
