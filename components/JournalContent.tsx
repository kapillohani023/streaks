"use client";
import Link from "next/link";
import { JournalEntry } from "@/types/journal-entry";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { JournalEntryList } from "@/components/journal/JournalEntryList";
import { JournalCalendar } from "@/components/journal/JournalCalendar";
import { WritingStreak } from "@/components/journal/WritingStreak";
import { MonoLabel } from "@/components/ui/SsMono";

interface JournalContentProps {
  entries: JournalEntry[];
}

export function JournalContent({ entries }: JournalContentProps) {
  const lastEntry = entries[0];

  return (
    /*
      A plain column on a phone, a two-track grid from lg up. The calendar is
      last in source order, so stacked it falls below the entry list where a
      reader reaches it after the things they came to do; the explicit
      `lg:row-start` placements pull it back up beside them in the sidebar
      once there is a second column, without rendering it twice.
    */
    <PageShell
      width="wide"
      layoutClassName="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-7"
    >
      <PageHeader
        className="lg:col-start-1 lg:row-start-1"
        eyebrow="LOGBOOK"
        title="Journal"
        subtitle={
          <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
            {entries.length} {entries.length === 1 ? "ENTRY" : "ENTRIES"}
            {lastEntry && (
              <>
                {" · LAST "}
                <Link
                  href={`/journal/${lastEntry.id}`}
                  className="text-foreground underline underline-offset-2"
                >
                  {lastEntry.title}
                </Link>
              </>
            )}
          </MonoLabel>
        }
      />

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <JournalEntryForm />
      </div>

      <div className="min-w-0 lg:col-start-1 lg:row-start-3">
        <JournalEntryList entries={entries} />
      </div>

      <aside className="flex flex-col gap-3.5 lg:sticky lg:top-5 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
        <JournalCalendar days={entries} />
        <WritingStreak days={entries} />
      </aside>
    </PageShell>
  );
}
