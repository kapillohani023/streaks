"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MoreVertical } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";

export interface SsMenuItem {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface SsMenuProps {
  items: SsMenuItem[];
  label?: string;
  align?: "left" | "right";
  triggerClassName?: string;
}

const ESTIMATED_MENU_HEIGHT = 120;

export function SsMenu({
  items,
  label = "Open menu",
  align = "right",
  triggerClassName = "",
}: SsMenuProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const toggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setOpenUpward(rect.bottom + ESTIMATED_MENU_HEIGHT > window.innerHeight);
    }
    setOpen((previous) => !previous);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={(event) => event.stopPropagation()}
    >
      <SsButton
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={`text-muted-foreground hover:text-foreground ${triggerClassName}`}
      >
        <MoreVertical size={18} />
      </SsButton>

      {open && (
        <div
          role="menu"
          className={[
            "ss-animate-scale-in border-border bg-card absolute z-40 min-w-44 overflow-hidden rounded-xl border p-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            openUpward ? "bottom-full mb-1" : "top-full mt-1",
          ].join(" ")}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => {
                event.stopPropagation();
                close();
                item.onSelect();
              }}
              className={[
                "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150",
                "disabled:cursor-not-allowed disabled:opacity-50",
                item.danger
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-card-foreground hover:bg-muted",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
