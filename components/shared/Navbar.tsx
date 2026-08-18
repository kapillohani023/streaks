"use client";
import {
  Kanban,
  LayoutDashboard,
  ListChecks,
  Notebook,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

enum NavbarLabel {
  Dashboard = "/dashboard",
  Streaks = "/streaks",
  AI = "/ai",
  Journal = "/journal",
  Todos = "/todos",
}

const NAV_ITEMS = [
  {
    href: NavbarLabel.Dashboard,
    icon: LayoutDashboard,
    name: "Dashboard",
    short: "DASH",
  },
  {
    href: NavbarLabel.Streaks,
    icon: ListChecks,
    name: "Streaks",
    short: "STREAKS",
  },
  { href: NavbarLabel.AI, icon: Sparkles, name: "AI", short: "AI" },
  {
    href: NavbarLabel.Journal,
    icon: Notebook,
    name: "Journal",
    short: "JOURNAL",
  },
  /*
    A three-stroke board rather than another rectangle grid: LayoutDashboard is
    already a panel of rects, and at 17px a second one would be a coin flip.
  */
  { href: NavbarLabel.Todos, icon: Kanban, name: "Todos", short: "TODOS" },
];

/**
 * The dock. Labelled rather than icon-only: five glyphs that all mean
 * "progress" are hard to tell apart at 17px, and the mono caption doubles as
 * the app's typographic signature at the bottom of every screen.
 *
 * The tabs share the row rather than each claiming a fixed 76px. At four tabs
 * fixed widths fitted a 360px phone with pixels to spare; the fifth leaves each
 * tab about 54px on a 320px screen, so they now flex down from 76px and the two
 * long captions are cut to their short forms — "DASHBOARD" to "DASH",
 * "ASSISTANT" to "AI" — which is what keeps neighbouring labels from running
 * into each other at the narrow end.
 */
export function Navbar() {
  const path = usePathname() ?? "";
  const router = useRouter();
  if (!Object.values(NavbarLabel).some((label) => path.startsWith(label))) {
    return null;
  }

  return (
    <div className="flex justify-center px-4 pt-2.5 pb-[max(1.125rem,env(safe-area-inset-bottom))]">
      <div className="border-border flex w-full max-w-[420px] items-center gap-0.5 rounded-xl border bg-[var(--panel-blur)] p-1 shadow-[var(--shadow-dock)] backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, icon: Icon, name, short }) => {
          const isActive = path.startsWith(href);
          return (
            <button
              key={href}
              type="button"
              aria-label={name}
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(href)}
              className={[
                "flex h-13 min-w-0 flex-1 basis-0 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[9px] transition-all duration-200 ease-out active:scale-95 sm:max-w-19",
                isActive
                  ? "bg-foreground text-background shadow-[0_0_18px_var(--glow-25)]"
                  : "text-dim hover:bg-sunken hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={17} />
              <span className="max-w-full truncate font-mono text-[9px] font-bold tracking-[0.12em]">
                {short}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
