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
      A grid rather than two columns: the calendar sits between the form and
      the list in source order — where it belongs on a phone — and gets moved
      into its own right-hand column from lg up, without rendering twice.
    */
    <PageShell
      width="wide"
      layoutClassName="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-7"
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

      <aside className="flex flex-col gap-3.5 lg:sticky lg:top-5 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start">
        <JournalCalendar days={entries} />
        <WritingStreak days={entries} />
      </aside>

      <div className="min-w-0 lg:col-start-1 lg:row-start-3">
        <JournalEntryList entries={entries} />
      </div>
    </PageShell>
  );
}
