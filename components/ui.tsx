import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-surface-inverse px-6 py-3 text-[14px] font-medium text-text-inverse transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-6 py-3 text-[14px] font-medium text-text-primary transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function ChoiceCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
        selected
          ? "border-navy-hi bg-navy-hi/[0.06] dark:bg-navy-hi/[0.12]"
          : "border-border-subtle hover:border-border-strong"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[15px] font-medium ${selected ? "text-navy-hi" : "text-text-primary"}`}>
          {title}
        </span>
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-navy-hi bg-navy-hi" : "border-border-strong"
          }`}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M4.5 12.5 9 17l10.5-11" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>
      {description && <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{description}</p>}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border-subtle bg-surface-1 ${className}`}>{children}</div>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "strong" | "solid" | "developing" }) {
  const toneClass = {
    neutral: "bg-surface-2 text-text-secondary",
    strong: "bg-strong/15 text-strong",
    solid: "bg-solid/15 text-solid dark:text-[#8fa1e8]",
    developing: "bg-developing/15 text-developing",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-subtle px-6 py-14 text-center">
      <h3 className="font-display text-lg">{title}</h3>
      <p className="max-w-xs text-[13px] leading-relaxed text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
