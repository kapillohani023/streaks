"use client"
import { DashboardCards } from "./dashboard/DashboardCards";
import { DailyCheckIn } from "./dashboard/DailyCheckIn";
import { useState, useEffect, useCallback } from "react";
import { Streak } from "@/types/streak";
import { fetchStreaks } from "@/lib/api";
import { signOut } from "next-auth/react";

export function Dashboard() {
    const [streaks, setStreaks] = useState<Streak[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadStreaks = useCallback(async () => {
        try {
            const loadedStreaks = await fetchStreaks();
            setStreaks(loadedStreaks);
        } catch (e) {
            console.error('Failed to load streaks:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStreaks();
    }, [loadStreaks]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }
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
                <DailyCheckIn streaks={streaks} onRefetch={loadStreaks} />
            </div>
        </div>
    );
}
