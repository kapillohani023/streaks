"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "streaks-theme";
/** Fired on `window` after a local write, since `storage` only reaches other tabs. */
const CHANGE_EVENT = "streaks-theme-change";

/**
 * The theme is whatever class is on `<html>` right now.
 *
 * The inline boot script in the layout puts it there before first paint, so
 * reading the DOM means this component never disagrees with what's on screen —
 * and never has to re-derive the preference and write it back on mount.
 */
function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function applyTheme(next: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private browsing can refuse the write; the class is already applied, so
    // the choice holds for this session and simply won't survive a reload.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function ThemeToggle() {
  // null on the server — the class it would read doesn't exist there yet.
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  const label =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="border-border bg-panel text-soft hover:border-mid hover:text-foreground flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 active:scale-95"
    >
      {/* Held back until the theme is known: a Sun that flips to a Moon on
          hydration is worse than a beat of empty square. */}
      {theme === "dark" ? (
        <Sun size={15} />
      ) : theme === "light" ? (
        <Moon size={15} />
      ) : null}
    </button>
  );
}
