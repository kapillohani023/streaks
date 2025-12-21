import React from 'react';
import { Plus } from 'lucide-react';
import { Streak } from '../lib/Streak';
import { isCompletedToday } from '@/utils/streak';

interface SidebarProps {
  streaks: Streak[];
  selectedStreakId: string | null;
  onSelectStreak: (id: string) => void;
  onCreateNew: () => void;
}

export function Sidebar({ streaks, selectedStreakId, onSelectStreak, onCreateNew }: SidebarProps) {
  return (
    <div className="w-64 border-r-2 border-black bg-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-2 border-black">
        <button
          onClick={() => onSelectStreak('')}
          className="text-left w-full"
        >
          <h1 className="text-2xl mb-1">Streaks</h1>
          <p className="text-sm text-zinc-600">Track your habits</p>
        </button>
      </div>

      {/* Streaks List */}
      <div className="flex-1 overflow-y-auto">
        {streaks.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 text-sm">
            No streaks yet.<br />Create your first one!
          </div>
        ) : (
          <div className="py-2">
            {streaks.map(streak => {              
              return (
                <button
                  key={streak.id}
                  onClick={() => onSelectStreak(streak.id)}
                  className={`w-full text-left px-6 py-3 hover:bg-zinc-100 transition-colors border-l-2 ${
                    selectedStreakId === streak.id
                      ? 'border-black bg-zinc-100'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{streak.name}</div>
                      <div className="text-xs text-zinc-600">
                        {streak.entries.length} days
                      </div>
                    </div>
                    {isCompletedToday(streak) && (
                      <div className="w-2 h-2 rounded-full bg-black ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t-2 border-black">
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded hover:bg-zinc-800 transition-colors"
        >
          <Plus size={20} />
          New Streak
        </button>
      </div>
    </div>
  );
}