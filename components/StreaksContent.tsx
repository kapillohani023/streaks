"use client"
import { Streak } from "@/types/streak";
import { useRouter } from "next/navigation";
import { StreaksList } from "./streaks/StreaksList";
import { AddNewStreak } from "./streaks/AddNewStreak";

interface StreaksContentProps {
    streaks: Streak[];
}

export function StreaksContent({ streaks }: StreaksContentProps) {
    const router = useRouter();

    const handleStreakClick = (streakId: string) => {
        router.push(`/streaks/${streakId}`);
    };

    return (
        <div className="flex bg-white text-black overflow-hidden h-full w-full">
            <div className="flex-1 flex flex-col overflow-hidden justify-start">
                <StreaksList streaks={streaks} onStreakClick={handleStreakClick} />
                <AddNewStreak />
            </div>
        </div>
    );
}
