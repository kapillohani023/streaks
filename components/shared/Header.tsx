"use client";

import { ListChecks } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { SsButton } from "@/components/ui/SsButton";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const APP_ROUTES = ["/dashboard", "/streaks", "/ai", "/journal"];

export function Header() {
  const path = usePathname() ?? "";
  const showActions = APP_ROUTES.some((route) => path.startsWith(route));

  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
          <ListChecks size={18} />
        </div>
        <span className="text-foreground text-sm font-semibold tracking-tight">
          Streaks
        </span>
      </div>
      {showActions && (
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <SsButton onClick={() => signOut()} variant="secondary" size="sm">
            Sign out
          </SsButton>
        </div>
      )}
    </div>
  );
}
