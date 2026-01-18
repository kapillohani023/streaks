"use client"
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { MarkAsCompleted } from "./streak-profile/MarkAsCompleted";
import { Streak } from "@/types/Streak";
import { fetchStreaks, deleteStreak } from "@/lib/api";
import { StreakCalendar } from "./streak-profile/StreakCalendar";
import { isCompletedToday } from "@/lib/util";
import { DeleteStreakButton } from "./streak-profile/DeleteStreakButton";

export default function StreakProfile() {
  const params = useParams();
  const router = useRouter();
  const streakId = params.id;
  const dummyStreak: Streak = {
    id: '-',
    name: '-',
    description: '-',
    startDate: new Date(),
    entries: []
  }
  const [streak, setStreak] = useState<Streak>(dummyStreak);
  const [isLoading, setIsLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    try {
      const loadedStreaks = await fetchStreaks();
      const streak = loadedStreaks.find((streak) => streak.id === streakId);
      if (streak) {
        setStreak(streak);
      }
    } catch (e) {
      console.error('Failed to load streaks:', e);
    } finally {
      setIsLoading(false);
    }
  }, [streakId]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const handleDelete = async (streakId: string) => {
    try {
      await deleteStreak(streakId);
      router.push('/dashboard');
    } catch (e) {
      console.error('Failed to delete streak:', e);
    }
  }

  const completedDates = streak.entries
    .filter((entry) => entry.completed)
    .map((entry) => entry.date);

  const completedDatesSet = new Set(completedDates.map(d => d.getTime()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const calculateCurrentStreak = () => {
    let count = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (completedDatesSet.has(date.getTime())) count++;
      else break;
    }
    return count;
  };

  const calculateLongestStreak = () => {
    if (completedDatesSet.size === 0) return 0;
    let maxStreak = 1;
    let currentStreak = 1;
    const sortedDates = [...completedDatesSet].sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const diffTime = sortedDates[i] - sortedDates[i - 1];
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return maxStreak;
  };

  const currentStreak = calculateCurrentStreak();
  const longestStreak = calculateLongestStreak();
  const totalScore = completedDatesSet.size;
  return (
    <div className="p-6 text-black bg-white w-full h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl mb-1">{streak.name}</h2>
          {streak.description && (
            <p className="text-zinc-600">{streak.description}</p>
          )}
        </div>
        <DeleteStreakButton streakId={streak.id} handleDelete={handleDelete} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border-2 border-black rounded p-4">
          <div className="text-zinc-600 text-sm mb-1">Current Streak</div>
          <div className="text-3xl">{currentStreak}</div>
        </div>
        <div className="border-2 border-black rounded p-4">
          <div className="text-zinc-600 text-sm mb-1">Longest Streak</div>
          <div className="text-3xl">{longestStreak}</div>
        </div>
        <div className="border-2 border-black rounded p-4">
          <div className="text-zinc-600 text-sm mb-1">Total Score</div>
          <div className="text-3xl">{totalScore}</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <StreakCalendar completedDates={completedDates} />
      </div>

      {/* Today button */}
      <MarkAsCompleted streak={streak} label={isCompletedToday(streak) ? 'Completed Today' : 'Mark Today Complete'} onSubmit={loadStreak} />
    </div>
  );
}