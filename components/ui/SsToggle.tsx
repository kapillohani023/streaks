"use client";

interface SsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible name — required, since the switch renders no text of its own. */
  label: string;
  id?: string;
}

/**
 * Borderless track, foreground when on. The knob inverts with it — dark on a
 * lit track, mid-grey on an unlit one — so the state is legible from the fill
 * alone, without relying on knob position.
 */
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
        "relative h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-out",
        "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-foreground" : "bg-border-strong",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-[3px] h-4 w-4 rounded-full transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          checked ? "bg-background left-[19px]" : "bg-dim left-[3px]",
        ].join(" ")}
      />
    </button>
  );
}
