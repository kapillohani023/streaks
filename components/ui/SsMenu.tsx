"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MoreVertical } from "lucide-react";
import { SsButton, type SsButtonProps } from "@/components/ui/SsButton";

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
  /**
   * Button skin for the trigger. `ghost` disappears into a row; `icon` gives it
   * a panel and a border, for when it stands alone in a page header.
   */
  triggerVariant?: SsButtonProps["variant"];
  triggerSize?: SsButtonProps["size"];
  /** Replaces the default kebab icon inside the trigger button. */
  trigger?: ReactNode;
  /** Non-interactive block above the items — identity, context, a count. */
  header?: ReactNode;
}

const ESTIMATED_MENU_HEIGHT = 120;

export function SsMenu({
  items,
  label = "Open menu",
  align = "right",
  triggerClassName = "",
  triggerVariant = "ghost",
  triggerSize = "icon-sm",
  trigger,
  header,
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
    /*
      `inline-flex`, not the default block: a block wrapper builds a line box
      around the inline-level trigger and adds a few px of descender space
      under it, so the button ends up sitting higher than any plain button
      beside it in a centred row. Shrink-wrapping the trigger removes the line
      box and puts the two back on the same axis.
    */
    <div
      ref={containerRef}
      className="relative inline-flex"
      onClick={(event) => event.stopPropagation()}
    >
      <SsButton
        ref={triggerRef}
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={triggerClassName}
      >
        {trigger ?? <MoreVertical size={15} />}
      </SsButton>

      {open && (
        /* panel-2, a rung above the cards it opens over, so the menu reads as
           floating without needing a heavier border. */
        <div
          role="menu"
          className={[
            "ss-animate-scale-in border-border-strong bg-panel-2 absolute z-50 min-w-44 overflow-hidden rounded-lg border p-1 shadow-[var(--shadow-menu)]",
            align === "right" ? "right-0" : "left-0",
            openUpward ? "bottom-full mb-1" : "top-full mt-1",
          ].join(" ")}
        >
          {header && (
            <div className="border-sunken mb-1 border-b px-2.5 pt-2 pb-2.5">
              {header}
            </div>
          )}
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
                "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors duration-150",
                "disabled:text-faint disabled:cursor-not-allowed disabled:hover:bg-transparent",
                item.danger
                  ? "text-bad hover:bg-bad-soft"
                  : "text-fg-soft hover:bg-sunken",
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
