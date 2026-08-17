"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/journal-entry";
import { deleteJournalEntry } from "@/app/actions/journal";
import { SsMenu } from "@/components/ui/SsMenu";
import { MonoLabel } from "@/components/ui/SsMono";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { DeleteJournalEntryDialog } from "@/components/journal/DeleteJournalEntryDialog";
import { JournalEntryNav } from "@/components/journal/JournalEntryNav";
import { countWords, formatClock, formatWeekday } from "@/lib/util";

interface JournalEntryViewProps {
  entry: JournalEntry;
  /** The entry written after this one — the one above it in the list. */
  newer?: JournalEntry | null;
  /** The entry written before this one — the one below it in the list. */
  older?: JournalEntry | null;
}

export function JournalEntryView({
  entry,
  newer = null,
  older = null,
}: JournalEntryViewProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const words = countWords(entry.entry);

  const goTo = useCallback(
    (target: JournalEntry | null) => {
      if (target) router.push(`/journal/${target.id}`);
    },
    [router]
  );

  // ← / → walk the journal in list order. Skipped while a dialog is open or the
  // user is typing, so the arrows never steal a caret keypress.
  useEffect(() => {
    if (deleteOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      ) {
        return;
      }

      if (event.key === "ArrowLeft") goTo(newer);
      else if (event.key === "ArrowRight") goTo(older);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteOpen, goTo, newer, older]);

  return (
    <PageShell width="narrow">
      {/*
        The title is the date, so the meta line underneath deliberately does not
        repeat it — weekday, clock and length are the facts it doesn't already
        state. Only the kebab rides in the header, matching the streak detail
        page; stepping between entries lives at the foot, where it can be
        labelled with the dates it actually goes to.
      */}
      <PageHeader
        onBack={() => router.push("/journal")}
        backLabel="Back to journal"
        eyebrow="LOGBOOK / ENTRY"
        title={entry.title}
        align="start"
        titleClassName="font-mono tracking-tight"
        subtitle={
          <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
            {formatWeekday(entry.createdAt)} · {formatClock(entry.createdAt)} ·{" "}
            {words} {words === 1 ? "WORD" : "WORDS"}
          </MonoLabel>
        }
        actions={
          <SsMenu
            label={`Actions for ${entry.title}`}
            triggerVariant="icon"
            triggerSize="icon"
            items={[
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                danger: true,
                onSelect: () => setDeleteOpen(true),
              },
            ]}
          />
        }
      />

      <article className="border-border bg-panel overflow-hidden rounded-xl border">
        <div className="border-divider border-b px-6 py-3">
          <MonoLabel as="h2">ENTRY</MonoLabel>
        </div>
        {/*
          16px on a 1.75 rhythm — a step up from the 15px used everywhere else
          in the app. This is the one surface in Streaks meant to be *read*
          rather than scanned, and it gets reading type to say so.
        */}
        <p className="text-fg-soft m-0 px-6 py-6 text-base leading-[1.75] whitespace-pre-wrap">
          {entry.entry}
        </p>
      </article>

      <JournalEntryNav newer={newer} older={older} onNavigate={goTo} />

      <DeleteJournalEntryDialog
        open={deleteOpen}
        entryTitle={entry.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteJournalEntry(entry.id);
          router.push("/journal");
        }}
      />
    </PageShell>
  );
}
