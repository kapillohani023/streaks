"use client";

import { useEffect } from "react";

interface SsLoaderOverlayProps {
  open: boolean;
  label?: string;
}

export function SsLoaderOverlay({
  open,
  label = "Loading...",
}: SsLoaderOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="ss-animate-fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      aria-live="polite"
      aria-label={label}
      role="status"
    >
      <div className="flex items-center">
        <span className="bar inline-block h-5 w-[3px] rounded-[10px] bg-primary"></span>
        <span className="bar bar-2 mx-[5px] inline-block h-[35px] w-[3px] rounded-[10px] bg-primary"></span>
        <span className="bar bar-3 inline-block h-5 w-[3px] rounded-[10px] bg-primary"></span>
      </div>

      <style jsx>{`
        .bar {
          animation: scale-up4 1s linear infinite;
        }

        .bar-2 {
          animation-delay: 0.25s;
        }

        .bar-3 {
          animation-delay: 0.5s;
        }

        @keyframes scale-up4 {
          20% {
            transform: scaleY(1.5);
          }

          40% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
