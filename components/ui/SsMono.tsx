import type { HTMLAttributes, ReactNode } from "react";

type MonoTone = "faint" | "dim" | "soft" | "fg" | "ok" | "bad";
type MonoSize = "eyebrow" | "tile" | "readout" | "micro";

const toneClass: Record<MonoTone, string> = {
  faint: "text-faint",
  dim: "text-dim",
  soft: "text-soft",
  fg: "text-foreground",
  ok: "text-ok",
  bad: "text-bad",
};

/*
  Four sizes, and they are not interchangeable. `eyebrow` names a region and is
  the widest-tracked; `tile` names a single number inside a card; `readout` is
  running mono text meant to be read as a value; `micro` is a caption on a
  control. Tracking loosens as the text gets shorter, which is what keeps the
  10px and 9px rows legible instead of turning into grey bars.
*/
const sizeClass: Record<MonoSize, string> = {
  eyebrow: "text-[10px] tracking-[0.2em] uppercase",
  tile: "text-[10px] tracking-[0.16em] uppercase",
  readout: "text-[11px] tracking-[0.08em]",
  micro: "text-[9px] tracking-[0.12em] uppercase",
};

export interface MonoLabelProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "span" | "h2" | "h3" | "p" | "label";
  tone?: MonoTone;
  size?: MonoSize;
  children: ReactNode;
}

/**
 * The instrument-panel label: mono, letterspaced, quiet. Used for every
 * section eyebrow, tile caption and inline readout in the app.
 *
 * It exists as a component rather than a class string because the pairing of
 * size and tracking is the whole idea — letting call sites mix a `tile` size
 * with an `eyebrow` tracking is how a system like this starts to look sloppy.
 */
export function MonoLabel({
  as: Component = "div",
  tone = "faint",
  size = "eyebrow",
  className = "",
  children,
  ...props
}: MonoLabelProps) {
  return (
    <Component
      className={["font-mono", sizeClass[size], toneClass[tone], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface MonoTagProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode;
  children: ReactNode;
}

/** A boxed mono chip — version badges, reminder times, entry counts. */
export function MonoTag({
  icon,
  className = "",
  children,
  ...props
}: MonoTagProps) {
  return (
    <span
      className={[
        "border-border text-faint inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-px font-mono text-[9px] tracking-[0.1em]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

export interface MonoStatProps {
  label: string;
  value: ReactNode;
  /** Trailing unit, set small and quiet so the number keeps the weight. */
  unit?: string;
  sub?: ReactNode;
  subTone?: MonoTone;
  className?: string;
}

/** Label / big number / footnote — the stat tile used across dashboard and detail. */
export function MonoStat({
  label,
  value,
  unit,
  sub,
  subTone = "faint",
  className = "",
}: MonoStatProps) {
  return (
    <div
      className={[
        "border-border bg-panel flex flex-col gap-1.5 rounded-xl border p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <MonoLabel size="tile">{label}</MonoLabel>
      <span className="text-foreground font-mono text-[26px] font-bold tracking-tight">
        {value}
        {unit && <span className="text-faint text-[11px]"> {unit}</span>}
      </span>
      {sub && (
        <MonoLabel size="tile" tone={subTone} className="tracking-normal">
          {sub}
        </MonoLabel>
      )}
    </div>
  );
}
