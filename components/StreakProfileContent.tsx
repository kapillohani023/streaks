"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Streak } from "@/types/streak";
import { StreakEntryHistory } from "@/components/streak-profile/StreakEntryHistory";
import { StreakMilestones } from "@/components/streak-profile/StreakMilestones";
import { ActivityHeatmap } from "@/components/shared/ActivityHeatmap";
import { deleteStreak } from "@/app/actions/streak";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { useStreakActions } from "@/components/streaks/StreakActions";
import { ReminderTag } from "@/components/streaks/StreakStatusChip";
import { MonoStat } from "@/components/ui/SsMono";
import { SsButton } from "@/components/ui/SsButton";
import {
  completedOffsets,
  consistency,
  currentRun,
  isDoneToday,
  longestRun,
  soloTotals,
} from "@/lib/stats";

interface StreakProfileContentProps {
  streak: Streak;
}

export function StreakProfileContent({ streak }: StreakProfileContentProps) {
  const router = useRouter();

  const handleBack = () => {
    // Fall back to the list when the page was opened directly (no history to pop).
    if (window.history.length > 1) router.back();
    else router.push("/streaks");
  };

  const handleDelete = async (streakId: string) => {
    try {
      await deleteStreak(streakId);
      router.push("/streaks");
    } catch (e) {
      console.error("Failed to delete streak:", e);
    }
  };

  const { menu, dialogs, markComplete } = useStreakActions({
    streak,
    onDelete: handleDelete,
    placement: "header",
  });

  const stats = useMemo(() => {
    const offsets = completedOffsets(streak);
    return {
      offsets,
      current: currentRun(offsets),
      longest: longestRun(offsets),
      total: offsets.size,
      consistency30: consistency(offsets, 30),
      done: isDoneToday(offsets),
      totals: soloTotals(offsets),
    };
  }, [streak]);

  return (
    <PageShell width="wide">
      <PageHeader
        onBack={handleBack}
        backLabel="Back to streaks"
        eyebrow={`STREAK / ${streak.id.slice(0, 8).toUpperCase()}`}
        title={streak.name}
        subtitle={streak.description || undefined}
        align="start"
        actions={
          <>
            {stats.done ? (
              /* A finished day gets a static badge, not a disabled button —
                 a greyed-out control invites a click that can't succeed. */
              <span className="border-ok-soft text-ok inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 font-mono text-[11px] font-bold tracking-[0.08em] uppercase">
                <Check size={12} strokeWidth={3} />
                Done today
              </span>
            ) : (
              <SsButton mono onClick={markComplete} className="shrink-0">
                Mark today
              </SsButton>
            )}
            {menu}
          </>
        }
      >
        {streak.reminderEnabled && streak.reminderTime && (
          <ReminderTag time={streak.reminderTime} className="mt-2 self-start" />
        )}
      </PageHeader>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        <MonoStat label="Current" value={stats.current} unit="days" />
        <MonoStat label="Longest" value={stats.longest} unit="days" />
        <MonoStat label="Total" value={stats.total} unit="days" />
        <MonoStat
          label="Consistency"
          value={`${stats.consistency30}%`}
          unit="/ 30d"
        />
      </div>

      <StreakMilestones run={stats.current} />

      <ActivityHeatmap
        label="ACTIVITY / 365 DAYS"
        totals={stats.totals}
        scale="binary"
        legend
      />

      <StreakEntryHistory entries={streak.entries} onAddEntry={markComplete} />

      {dialogs}
    </PageShell>
  );
}
