"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/shared/AccountMenu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { BrandMark } from "@/components/shared/BrandMark";
import { MonoLabel } from "@/components/ui/SsMono";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { formatStamp } from "@/lib/stats";

const APP_ROUTES = ["/dashboard", "/streaks", "/ai", "/journal", "/todos"];

export function Header() {
  const path = usePathname() ?? "";
  const showActions = APP_ROUTES.some((route) => path.startsWith(route));

  // Sign-in carries its own lockup inside the card; a second one 40px above it
  // just reads as a duplicate.
  if (path.startsWith("/signin")) return null;

  return (
    <div className="border-hair flex items-center justify-between border-b px-5 pt-3.5 pb-2.5">
      <Link
        href={showActions ? "/dashboard" : "/"}
        className="flex items-center gap-2.5"
        aria-label="Streaks home"
      >
        <BrandMark size={28} />
        <span className="text-foreground font-mono text-xs font-bold tracking-[0.18em]">
          STREAKS
        </span>
      </Link>
      {showActions && (
        <div className="flex items-center gap-3">
          <DateStamp />
          <ThemeToggle />
          <AccountMenu />
        </div>
      )}
    </div>
  );
}

/**
 * Today's date, rendered only after mount.
 *
 * The server renders in its own timezone, so emitting the stamp during SSR
 * guarantees a hydration mismatch for anyone not sitting on the deploy region's
 * clock — and the date is the one thing on screen that must not be wrong.
 */
function DateStamp() {
  const hydrated = useIsHydrated();

  return (
    <MonoLabel
      as="span"
      size="readout"
      tone="soft"
      className="hidden sm:inline"
    >
      {hydrated ? formatStamp() : ""}
    </MonoLabel>
  );
}
