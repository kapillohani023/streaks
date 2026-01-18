"use client"
import { LayoutDashboard, ListChecks, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

enum NavbarLabel {
    Dashboard = "/dashboard",
    Streaks = "/streaks",
    AI = "/ai",
}

export function Navbar() {
    const path = usePathname();
    const router = useRouter();
    if (!Object.values(NavbarLabel).some(label => path.startsWith(label))) {
        return null;
    }
    const navButtonClass = (label: string) =>
        `flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 cursor-pointer
   ${path.startsWith(label)
            ? "bg-black text-white"
            : "bg-transparent text-black hover:bg-gray-100"}`;
    const handleNavigation = (label: string) => {
        router.push(label);
    }
    return (
        <div className="flex items-center justify-around px-8 py-6 border-t-2 border-black bg-white">
            <div className="flex flex-1 items-center justify-around">
                <button className={navButtonClass(NavbarLabel.Dashboard)} onClick={() => handleNavigation(NavbarLabel.Dashboard)}>
                    <LayoutDashboard size={32} />
                </button>
                <button className={navButtonClass(NavbarLabel.Streaks)} onClick={() => handleNavigation(NavbarLabel.Streaks)}>
                    <ListChecks size={32} />
                </button>
                <button className={navButtonClass(NavbarLabel.AI)} onClick={() => handleNavigation(NavbarLabel.AI)}>
                    <Sparkles size={32} />
                </button>
            </div>
        </div>
    )
}