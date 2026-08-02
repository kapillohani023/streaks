"use client";
import Link from "next/link";
import { Notebook } from "lucide-react";
import { JournalEntry } from "@/types/journal-entry";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { JournalEntryList } from "@/components/journal/JournalEntryList";
import { JournalCalendar } from "@/components/journal/JournalCalendar";

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
      layoutClassName="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-x-8"
    >
      <PageHeader
        className="lg:col-start-1 lg:row-start-1"
        icon={<Notebook size={20} />}
        title="Journal"
        subtitle={
          <>
            {entries.length === 0
              ? "Your writing space"
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
            {lastEntry && (
              <>
                {" · last written "}
                <Link
                  href={`/journal/${lastEntry.id}`}
                  className="text-foreground font-mono underline underline-offset-2"
                >
                  {lastEntry.title}
                </Link>
              </>
            )}
          </>
        }
      />

      <div className="min-w-0 lg:col-start-1 lg:row-start-2">
        <JournalEntryForm />
      </div>

      <aside className="border-border border-t pt-6 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start lg:border-t-0 lg:pt-0">
        <JournalCalendar days={entries} />
      </aside>

      <div className="border-border min-w-0 border-t pt-6 lg:col-start-1 lg:row-start-3">
        <JournalEntryList entries={entries} />
      </div>
    </PageShell>
  );
}
