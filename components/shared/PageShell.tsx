import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";
import { MonoLabel } from "@/components/ui/SsMono";
import { SsTypography } from "@/components/ui/SsTypography";

/**
 * The only two content widths a page may use. Reading and conversation
 * surfaces stay narrow; multi-column app surfaces get the wider track. Anything
 * outside this pair makes the content edge jump when you switch tabs.
 */
export const PAGE_WIDTH = {
  narrow: "max-w-[760px]",
  wide: "max-w-[1080px]",
} as const;

export type PageWidth = keyof typeof PAGE_WIDTH;

export interface PageShellProps {
  width?: PageWidth;
  /**
   * Replaces (not extends) the default stacking, for pages that need their own
   * layout — a grid, say. Overriding rather than appending keeps two `display`
   * utilities from racing each other in the stylesheet.
   */
  layoutClassName?: string;
  children: ReactNode;
}

/**
 * The scroll root for a page. Owns the single scroll container, the centred
 * track and the page padding so every tab starts from the same edges.
 *
 * `overflow-y-auto` rather than `overflow-y-scroll`: the latter reserves a
 * permanent scrollbar gutter, which showed a grey track on some tabs and not
 * others.
 */
export function PageShell({
  width = "wide",
  layoutClassName = "flex flex-col gap-5",
  children,
}: PageShellProps) {
  return (
    <div className="text-foreground h-full min-h-0 w-full overflow-y-auto overscroll-contain">
      <div
        className={[
          "ss-animate-page-in mx-auto w-full px-5 pt-6 pb-12",
          PAGE_WIDTH[width],
          layoutClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export interface PageHeaderProps {
  /**
   * Mono kicker above the title. Every screen names its own region — OVERVIEW,
   * REGISTRY, LOGBOOK, COPILOT — which is what makes the tabs feel like parts
   * of one instrument rather than four separate apps.
   */
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  /** Swaps in a back button ahead of the title — the detail-page variant. */
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  /** Trailing readout, e.g. "DAY 229 / 365". */
  meta?: ReactNode;
  /**
   * Where the trailing group sits against a multi-line title block.
   *
   * `end` (the default) hangs a primary button off the title's baseline, which
   * is what a one-line header wants. `start` lifts it level with the eyebrow —
   * the right answer once a description pushes the block to three lines and a
   * bottom-aligned button would float away from the heading it belongs to.
   */
  align?: "start" | "end";
  titleClassName?: string;
  className?: string;
  /** Extra rows under the subtitle, kept inside the title column so they share its left edge. */
  children?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = "Go back",
  actions,
  meta,
  align = "end",
  titleClassName = "",
  className = "",
  children,
}: PageHeaderProps) {
  return (
    <header
      className={[
        "flex flex-wrap justify-between gap-x-3 gap-y-2",
        align === "start" ? "items-start" : "items-end",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        {/*
          Flush to the top of the header, with no nudge of its own — the
          trailing actions sit at the container top too, and any offset here
          alone would leave the two ends of the same row out of line.
        */}
        {onBack && (
          <SsButton
            onClick={onBack}
            variant="icon"
            size="icon"
            aria-label={backLabel}
            className="shrink-0"
          >
            <ArrowLeft size={18} />
          </SsButton>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {eyebrow && <MonoLabel className="mb-1">{eyebrow}</MonoLabel>}
          <SsTypography as="h1" variant="h2" className={titleClassName}>
            {title}
          </SsTypography>
          {subtitle && (
            <SsTypography as="p" variant="muted" className="mt-0.5">
              {subtitle}
            </SsTypography>
          )}
          {children}
        </div>
      </div>

      {(actions || meta) && (
        <div className="flex shrink-0 items-center gap-2.5">
          {meta}
          {actions}
        </div>
      )}
    </header>
  );
}
