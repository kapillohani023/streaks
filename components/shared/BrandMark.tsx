import { ListChecks } from "lucide-react";

interface BrandMarkProps {
  /** Edge length of the square, in px. The glyph scales to ~57% of it. */
  size?: number;
  /** Adds the ambient halo — used on the sign-in card, not in the header. */
  glow?: boolean;
  className?: string;
}

/**
 * The inverted square: foreground fill, background glyph. It is the only solid
 * block of foreground colour on most screens, which is what makes it read as
 * the mark rather than as another button.
 */
export function BrandMark({
  size = 28,
  glow = false,
  className = "",
}: BrandMarkProps) {
  return (
    <span
      style={{ width: size, height: size, borderRadius: size <= 30 ? 6 : 8 }}
      className={[
        "bg-foreground text-background flex shrink-0 items-center justify-center",
        glow ? "shadow-[0_0_24px_var(--glow-25)]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ListChecks size={Math.round(size * 0.57)} strokeWidth={2} />
    </span>
  );
}
