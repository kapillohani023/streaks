"use client"

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { StreakCard } from '../components/StreakCard';
import { Streak } from '../lib/Streak';
import { StreakEntry } from '../lib/StreakEntry';
import { CreateStreakDialog } from '../components/CreateStreakDialog';
import { NotesDialog } from '../components/NotesDialog';
import { Sidebar } from '../components/Sidebar';
import { HomeDashboard } from '../components/HomeDashboard';
import { isCompletedToday } from '../utils/streak';

export default function App() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [selectedStreakId, setSelectedStreakId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notesDialog, setNotesDialog] = useState<{ isOpen: boolean; streakId: string | null }>({
    isOpen: false,
    streakId: null,
  });

  // Load streaks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('streaks');
    if (saved) {
      try {
        const loadedStreaks = JSON.parse(saved);
        setStreaks(loadedStreaks);
        // Don't auto-select any streak - show home dashboard by default
      } catch (e) {
        console.error('Failed to load streaks:', e);
      }
    }
  }, []);

  // Save streaks to localStorage
  useEffect(() => {
    if (streaks.length > 0) {
      localStorage.setItem('streaks', JSON.stringify(streaks));
    } else {
      localStorage.removeItem('streaks');
    }
  }, [streaks]);

  const handleCreateStreak = (name: string, description: string) => {
    const newStreak: Streak = {
      id: Date.now().toString(),
      name,
      description,
      entries: [],
      startDate: Date.now(),
    };
    setStreaks([...streaks, newStreak]);
    setSelectedStreakId(newStreak.id);
  };

  const handleDeleteStreak = (id: string) => {
    const newStreaks = streaks.filter(s => s.id !== id);
    setStreaks(newStreaks);

    // Go back to home if deleted streak was selected
    if (selectedStreakId === id) {
      setSelectedStreakId(null);
    }
  };

  const handleSaveNote = (streakId: string, note: string) => {
    const streak = streaks.find(s => s.id === streakId);
    if (streak) {
      const streakEntry: StreakEntry = {
        id: Date.now().toString(),
        date: Date.now(),
        note,
        completed: true,
      }
      streak.entries.push(streakEntry);
      setStreaks([...streaks]);
      setNotesDialog({ isOpen: false, streakId: null });
    }
  };

  const handleDailyCheck = (streakId: string) => {
    const streak = streaks.find(s => s.id === streakId);
    if (streak && !isCompletedToday(streak)) {
      setNotesDialog({ isOpen: true, streakId });
    }
  };

  const handleSelectStreak = (id: string) => {
    // If empty string, go to home
    if (id === '') {
      setSelectedStreakId(null);
    } else {
      setSelectedStreakId(id);
    }
  };

  const selectedStreak = streaks.find(s => s.id === selectedStreakId);
  const today = new Date().toDateString();
  const currentNote = notesDialog.streakId
    ? streaks.find(s => s.id === notesDialog.streakId)?.entries.find(e => new Date(e.date).toDateString() === today)?.note || ''
    : '';
  const notesStreakName = notesDialog.streakId
    ? streaks.find(s => s.id === notesDialog.streakId)?.name || ''
    : '';

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        streaks={streaks}
        selectedStreakId={selectedStreakId}
        onSelectStreak={handleSelectStreak}
        onCreateNew={() => setIsDialogOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Daily Check Section */}
        {streaks.length > 0 && (
          <div className="border-b-2 border-black bg-white">
            <div className="px-8 py-6">
              <h2 className="text-sm text-zinc-600 mb-4">DAILY CHECK-IN</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {streaks.map(streak => {
                  const isCompleted = isCompletedToday(streak);
                  return (
                    <button
                      key={streak.id}
                      onClick={() => handleDailyCheck(streak.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded border-2 transition-colors whitespace-nowrap ${isCompleted
                          ? 'border-black bg-black text-white'
                          : 'border-black hover:bg-zinc-100'
                        }`}
                    >
                      {isCompleted && <Check size={16} />}
                      {streak.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedStreakId ? (
            <HomeDashboard streaks={streaks} />
          ) : selectedStreak ? (
            <div className="p-8">
              <StreakCard
                streak={selectedStreak}
                onDelete={handleDeleteStreak}
                onToggleToday={handleDailyCheck}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Dialogs */}
      <CreateStreakDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreate={handleCreateStreak}
      />

      <NotesDialog
        isOpen={notesDialog.isOpen}
        onClose={() => setNotesDialog({ isOpen: false, streakId: null })}
        streakName={notesStreakName}
        existingNote={currentNote}
        onSave={(note) => {
          if (notesDialog.streakId) {
            handleSaveNote(notesDialog.streakId, note);
          }
        }}
      />
    </div>
  );
}
