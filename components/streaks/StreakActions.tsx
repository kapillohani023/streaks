"use client";
import { useState, type ReactNode } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Streak } from "@/types/streak";
import { isCompletedToday } from "@/lib/util";
import { SsMenu } from "@/components/ui/SsMenu";
import { EntrySubmissionDialog } from "@/components/streak-profile/MarkAsCompleted";
import { DeleteStreakDialog } from "@/components/streak-profile/DeleteStreakButton";
import { EditStreakDialog } from "@/components/streaks/EditStreakDialog";

interface UseStreakActionsOptions {
  streak: Streak;
  /** Called after the delete is confirmed — callers differ on where to go next. */
  onDelete: (streakId: string) => Promise<void> | void;
}

export interface StreakActions {
  /** The overflow-menu trigger. Drop it wherever the layout needs it. */
  menu: ReactNode;
  /** Dialogs backing every menu item. Render once, anywhere in the subtree. */
  dialogs: ReactNode;
  /** Opens the "mark complete" note dialog from outside the menu. */
  markComplete: () => void;
}

/**
 * The action set a streak carries with it — mark complete, edit, delete —
 * together with the dialogs each one opens.
 *
 * A hook rather than a component because the list and the profile put the
 * trigger in different places, and the profile also needs to fire the
 * "mark complete" action from its empty state. Callers get the pieces and
 * decide on layout; the dialog state stays owned here so neither call site
 * has to re-declare it.
 */
export function useStreakActions({
  streak,
  onDelete,
}: UseStreakActionsOptions): StreakActions {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const completedToday = isCompletedToday(streak);

  const menu = (
    <SsMenu
      label={`Actions for ${streak.name}`}
      items={[
        {
          label: completedToday ? "Completed today" : "Mark complete",
          icon: <Check size={16} />,
          disabled: completedToday,
          onSelect: () => setIsEntryDialogOpen(true),
        },
        {
          label: "Edit",
          icon: <Pencil size={16} />,
          onSelect: () => setIsEditDialogOpen(true),
        },
        {
          label: "Delete",
          icon: <Trash2 size={16} />,
          danger: true,
          onSelect: () => setIsDeleteDialogOpen(true),
        },
      ]}
    />
  );

  const dialogs = (
    <>
      <EntrySubmissionDialog
        isOpen={isEntryDialogOpen}
        onClose={() => setIsEntryDialogOpen(false)}
        streak={streak}
      />
      <EditStreakDialog
        open={isEditDialogOpen}
        streak={streak}
        onClose={() => setIsEditDialogOpen(false)}
      />
      <DeleteStreakDialog
        open={isDeleteDialogOpen}
        streakId={streak.id}
        streakName={streak.name}
        onClose={() => setIsDeleteDialogOpen(false)}
        handleDelete={onDelete}
      />
    </>
  );

  return { menu, dialogs, markComplete: () => setIsEntryDialogOpen(true) };
}
