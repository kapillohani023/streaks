"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "streaks-theme";

interface ThemeToggleProps {
  size?: "sm" | "md";
}

const sizeClass: Record<NonNullable<ThemeToggleProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

const iconSize: Record<NonNullable<ThemeToggleProps["size"]>, number> = {
  sm: 16,
  md: 18,
};

export function ThemeToggle({ size = "md" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className={`flex ${sizeClass[size]} border-border bg-card text-foreground hover:bg-muted cursor-pointer items-center justify-center rounded-full border shadow-sm transition-all duration-200 active:scale-95`}
    >
      {theme === "dark" ? (
        <Sun size={iconSize[size]} />
      ) : (
        <Moon size={iconSize[size]} />
      )}
    </button>
  );
}
