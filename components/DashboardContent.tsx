"use client"
import { DashboardCards } from "./dashboard/DashboardCards";
import { DailyCheckIn } from "./dashboard/DailyCheckIn";
import { Streak } from "@/types/streak";
import { signOut } from "next-auth/react";

interface DashboardContentProps {
    streaks: Streak[];
}

export function DashboardContent({ streaks }: DashboardContentProps) {
    return (
        <div className="flex bg-white text-black h-full w-full min-h-0 overflow-y-scroll">
            <div className="flex-1 flex flex-col justify-start">
                <div className="w-full flex justify-end p-2">
                    <button
                        onClick={() => signOut()}
                        className="bg-white text-black font-semibold hover:bg-zinc-100 p-2 rounded cursor-pointer border-black border-2"
                    >
                        Sign out
                    </button>
                </div>
                <DashboardCards streaks={streaks} />
                <DailyCheckIn streaks={streaks} />
            </div>
        </div>
    );
}
