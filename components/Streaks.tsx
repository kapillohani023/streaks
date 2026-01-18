"use client"
import { Streak } from "@/types/Streak";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchStreaks, createStreak } from "../lib/api";
import { StreaksList } from "./streaks/StreaksList";
import { AddNewStreak } from "./streaks/AddNewStreak";



export function Streaks() {
    const router = useRouter();
    const [streaks, setStreaks] = useState<Streak[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStreaks = async () => {
            try {
                const loadedStreaks = await fetchStreaks();
                setStreaks(loadedStreaks);
            } catch (e) {
                console.error('Failed to load streaks:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStreaks();
    }, []);

    const handleCreateStreak = async (name: string, description: string) => {
        try {
            const newStreak = await createStreak(name, description);
            setStreaks([...streaks, newStreak]);
        } catch (e) {
            console.error('Failed to create streak:', e);
        }
    };
    const handleStreakClick = (streakId: string) => {
        router.push(`/streaks/${streakId}`);
    };
    return (
        <div className="flex bg-white text-black overflow-hidden h-full w-full">
            <div className="flex-1 flex flex-col overflow-hidden justify-start">
                <StreaksList streaks={streaks} onStreakClick={handleStreakClick} />
                <AddNewStreak onCreateNew={handleCreateStreak} />
            </div>
        </div>
    );
}
