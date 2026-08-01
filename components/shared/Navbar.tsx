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
  { label: NavbarLabel.Dashboard, icon: LayoutDashboard, name: "Dashboard" },
  { label: NavbarLabel.Streaks, icon: ListChecks, name: "Streaks" },
  { label: NavbarLabel.AI, icon: Sparkles, name: "AI" },
  { label: NavbarLabel.Journal, icon: Notebook, name: "Journal" },
];

export function Navbar() {
  const path = usePathname() ?? "";
  const router = useRouter();
  if (!Object.values(NavbarLabel).some((label) => path.startsWith(label))) {
    return null;
  }

  return (
    <div className="flex justify-center px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="border-border bg-card flex items-center gap-1 rounded-full border px-2 py-2 shadow-lg">
        {NAV_ITEMS.map(({ label, icon: Icon, name }) => {
          const isActive = path.startsWith(label);
          return (
            <button
              key={label}
              type="button"
              aria-label={name}
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(label)}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }
                  : undefined
              }
              className={[
                "flex h-12 w-16 cursor-pointer items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-95",
                isActive
                  ? "shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={24} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
