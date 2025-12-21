import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { StreakCalendar } from './StreakCalendar';
import { Streak } from '../lib/Streak';
import { isCompletedToday } from '@/utils/streak';

interface StreakCardProps {
  streak: Streak;
  onDelete: (id: string) => void;
  onToggleToday: (id: string) => void;
}

export function StreakCard({ streak, onDelete, onToggleToday }: StreakCardProps) {
  // Convert timestamps to date strings (normalized to midnight) for comparison
  const completedDatesSet = new Set(
    streak.entries
      .filter((entry) => entry.completed)
      .map((entry) => {
        const d = new Date(entry.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // Calculate current streak
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

  // Calculate longest streak
  const calculateLongestStreak = () => {
    if (completedDatesSet.size === 0) return 0;
    let maxStreak = 1;
    let currentStreak = 1;
    const sortedDates = [...completedDatesSet].sort();
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
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
    <div className="border-2 border-black rounded-lg p-6 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl mb-1">{streak.name}</h2>
          {streak.description && (
            <p className="text-zinc-600">{streak.description}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(streak.id)}
          className="text-zinc-600 hover:text-black transition-colors p-2"
          aria-label="Delete streak"
        >
          <Trash2 size={20} />
        </button>
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
        <StreakCalendar completedDates={Array.from(completedDatesSet).map(t => new Date(t))} />
      </div>

      {/* Today button */}
      <button
        onClick={() => onToggleToday(streak.id)}
        className={`w-full py-3 rounded border-2 transition-colors ${isCompletedToday(streak)
            ? 'border-black bg-black text-white hover:bg-zinc-800'
            : 'border-black bg-white text-black hover:bg-zinc-100'
          }`}
      >
        <span className="flex items-center justify-center gap-2">
          {isCompletedToday(streak) && <Check size={20} />}
          {isCompletedToday(streak) ? 'Completed Today' : 'Mark Today Complete'}
        </span>
      </button>
    </div>
  );
}