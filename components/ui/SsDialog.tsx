"use client";

import { type MouseEvent, type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";
import {
  SsCard,
  SsCardContent,
  SsCardHeader,
  SsCardTitle,
} from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";

interface SsDialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
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
  title,
  subtitle,
  disableClose = false,
  showCloseButton = true,
  closeOnBackdrop = true,
  maxWidthClassName = "max-w-md",
  contentClassName = "p-6",
  panelClassName = "",
}: SsDialogProps) {
  useEffect(() => {
    if (!open || disableClose) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, disableClose, onClose]);

  if (!open) return null;

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (disableClose || !closeOnBackdrop) return;
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  return (
    <div
      className="ss-animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropMouseDown}
    >
      <SsCard
        variant="elevated"
        padding="none"
        className={`ss-animate-scale-in w-full ${maxWidthClassName} ${panelClassName}`}
      >
        {(title || subtitle || showCloseButton) && (
          <SsCardHeader className="border-border mb-0 flex items-center justify-between border-b p-6">
            <div>
              {title && <SsCardTitle>{title}</SsCardTitle>}
              {subtitle && (
                <SsTypography variant="muted">{subtitle}</SsTypography>
              )}
            </div>
            {showCloseButton && (
              <SsButton
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close dialog"
                disabled={disableClose}
              >
                <X size={24} />
              </SsButton>
            )}
          </SsCardHeader>
        )}
        <SsCardContent className={contentClassName}>{children}</SsCardContent>
      </SsCard>
    </div>
  );
}
