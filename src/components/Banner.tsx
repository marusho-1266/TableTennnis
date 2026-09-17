import type { ReactNode } from "react";

export interface BannerProps {
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function Banner({ children, actionLabel, onAction }: BannerProps) {
  return (
    <div className="save-banner" role="alert">
      <span>{children}</span>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
