"use client";

interface SsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name — required, since the switch renders no text of its own. */
  label: string;
  id?: string;
}

export function SsToggle({
  checked,
  onChange,
  disabled = false,
  label,
  id,
}: SsToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ease-out",
        "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ease-out",
          checked
            ? "bg-primary-foreground translate-x-6"
            : "bg-card translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
