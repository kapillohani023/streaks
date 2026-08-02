import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";
import { SsTypography } from "@/components/ui/SsTypography";

/**
 * The only two content widths a page may use. Reading and conversation
 * surfaces stay narrow; multi-column app surfaces get the wider track. Anything
 * outside this pair makes the content edge jump when you switch tabs.
 */
export const PAGE_WIDTH = {
  narrow: "max-w-3xl",
  wide: "max-w-5xl",
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
  layoutClassName = "flex flex-col gap-6",
  children,
}: PageShellProps) {
  return (
    <div className="bg-background text-foreground h-full min-h-0 w-full overflow-y-auto overscroll-contain">
      <div
        className={[
          "mx-auto w-full px-4 pt-4 pb-10",
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
  title: string;
  subtitle?: ReactNode;
  /** Leading glyph, shown in a muted circle. Ignored when `onBack` is set. */
  icon?: ReactNode;
  /** Swaps the icon for a back button — the detail-page variant of the header. */
  onBack?: () => void;
  backLabel?: string;
  actions?: ReactNode;
  titleClassName?: string;
  className?: string;
  /** Extra rows under the subtitle, kept inside the title column so they share its left edge. */
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  onBack,
  backLabel = "Go back",
  actions,
  titleClassName = "",
  className = "",
  children,
}: PageHeaderProps) {
  return (
    <header
      className={["flex items-start gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      {onBack ? (
        <SsButton
          onClick={onBack}
          variant="ghost"
          size="icon"
          aria-label={backLabel}
          className="text-muted-foreground hover:text-foreground shrink-0 rounded-full"
        >
          <ArrowLeft size={20} />
        </SsButton>
      ) : icon ? (
        <div className="bg-muted text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <SsTypography as="h1" variant="h3" className={titleClassName}>
          {title}
        </SsTypography>
        {subtitle && (
          <SsTypography as="p" variant="caption">
            {subtitle}
          </SsTypography>
        )}
        {children}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </header>
  );
}
