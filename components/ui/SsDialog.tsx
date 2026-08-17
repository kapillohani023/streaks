"use client";

import { type MouseEvent, type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { MonoLabel } from "@/components/ui/SsMono";
import { SsCard, SsCardTitle } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";

interface SsDialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Mono kicker above the title — says which part of the app this belongs to. */
  eyebrow?: string;
  /** Red kicker for dialogs that destroy something, before the title is read. */
  eyebrowTone?: "faint" | "bad";
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Rules a line under the header. For dialogs whose body is itself sectioned. */
  divided?: boolean;
  disableClose?: boolean;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  maxWidthClassName?: string;
  contentClassName?: string;
  panelClassName?: string;
}

export function SsDialog({
  open,
  onClose,
  children,
  eyebrow,
  eyebrowTone = "faint",
  title,
  subtitle,
  divided = false,
  disableClose = false,
  showCloseButton = false,
  closeOnBackdrop = true,
  maxWidthClassName = "max-w-[440px]",
  contentClassName = "",
  panelClassName = "",
}: SsDialogProps) {
  useEffect(() => {
    if (!open || disableClose) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, disableClose, onClose]);

  if (!open) return null;

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (disableClose || !closeOnBackdrop) return;
    if (event.currentTarget === event.target) onClose();
  };

  const hasHeader = Boolean(eyebrow || title || subtitle || showCloseButton);

  return (
    <div
      className="ss-animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropMouseDown}
    >
      <SsCard
        variant="elevated"
        padding="none"
        className={`ss-animate-scale-in w-full overflow-hidden ${maxWidthClassName} ${panelClassName}`}
      >
        {hasHeader && (
          <div
            className={[
              "flex items-start justify-between gap-3",
              divided ? "border-divider border-b p-5" : "px-6 pt-6 pb-4",
            ].join(" ")}
          >
            <div className="min-w-0">
              {eyebrow && (
                <MonoLabel tone={eyebrowTone} className="mb-1">
                  {eyebrow}
                </MonoLabel>
              )}
              {title && <SsCardTitle>{title}</SsCardTitle>}
              {subtitle && (
                <SsTypography variant="muted" className="mt-0.5">
                  {subtitle}
                </SsTypography>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                disabled={disableClose}
                aria-label="Close dialog"
                className="text-faint hover:bg-sunken hover:text-foreground flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}
        <div className={contentClassName || (hasHeader ? "px-6 pb-6" : "p-6")}>
          {children}
        </div>
      </SsCard>
    </div>
  );
}
