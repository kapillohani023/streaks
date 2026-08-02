"use client";

import { useEffect, useRef, type TextareaHTMLAttributes } from "react";

export interface SsGrowTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "style"
> {
  value: string;
  /** Floor the box never shrinks below, in px. */
  minHeight?: number;
  /** Ceiling after which the box scrolls instead of growing, in px. */
  maxHeight?: number;
  /** Set false where the container owns the height and a drag handle would fight it. */
  resizable?: boolean;
}

/**
 * A textarea that grows with what you write, and stops growing the moment you
 * drag it to a size of your own.
 *
 * Auto-growth and a drag handle fight over the same `height`, so the drag has
 * to win: a ResizeObserver watches for any height we did not set ourselves and
 * treats it as the user taking over.
 */
export function SsGrowTextarea({
  value,
  minHeight = 180,
  maxHeight = 640,
  resizable = true,
  className = "",
  ...props
}: SsGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const appliedHeight = useRef<number | null>(null);
  const userResized = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || userResized.current) return;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    appliedHeight.current = next;
  }, [value, minHeight, maxHeight]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !resizable) return;
    const observer = new ResizeObserver(() => {
      if (appliedHeight.current === null) return;
      if (Math.abs(el.offsetHeight - appliedHeight.current) > 1) {
        userResized.current = true;
        el.style.overflowY = "auto";
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [resizable]);

  return (
    <textarea
      ref={ref}
      value={value}
      className={[
        "border-input-border bg-card text-card-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-xl border px-4 py-3 text-base leading-relaxed transition-colors duration-200 focus:border-transparent focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        resizable ? "resize-y" : "resize-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
