"use client";
import { LayoutDashboard, ListChecks, Notebook, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

enum NavbarLabel {
  Dashboard = "/dashboard",
  Streaks = "/streaks",
  AI = "/ai",
  Journal = "/journal",
}

const NAV_ITEMS = [
  {
    href: NavbarLabel.Dashboard,
    icon: LayoutDashboard,
    name: "Dashboard",
    short: "DASHBOARD",
  },
  {
    href: NavbarLabel.Streaks,
    icon: ListChecks,
    name: "Streaks",
    short: "STREAKS",
  },
  { href: NavbarLabel.AI, icon: Sparkles, name: "AI", short: "ASSISTANT" },
  {
    href: NavbarLabel.Journal,
    icon: Notebook,
    name: "Journal",
    short: "JOURNAL",
  },
];

/**
 * The dock. Labelled rather than icon-only: four glyphs that all mean
 * "progress" are hard to tell apart at 17px, and the mono caption doubles as
 * the app's typographic signature at the bottom of every screen.
 */
export function Navbar() {
  const path = usePathname() ?? "";
  const router = useRouter();
  if (!Object.values(NavbarLabel).some((label) => path.startsWith(label))) {
    return null;
  }

  return (
    <div className="flex justify-center px-4 pt-2.5 pb-[max(1.125rem,env(safe-area-inset-bottom))]">
      <div className="border-border flex items-center gap-0.5 rounded-xl border bg-[var(--panel-blur)] p-1 shadow-[var(--shadow-dock)] backdrop-blur-xl">
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
                "flex h-13 w-19 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[9px] transition-all duration-200 ease-out active:scale-95",
                isActive
                  ? "bg-foreground text-background shadow-[0_0_18px_var(--glow-25)]"
                  : "text-dim hover:bg-sunken hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={17} />
              <span className="font-mono text-[9px] font-bold tracking-[0.12em]">
                {short}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
