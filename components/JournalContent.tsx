"use client";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/journal-entry";
import { SsTypography } from "@/components/ui/SsTypography";
import { JournalSearch } from "@/components/journal/JournalSearch";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";

interface JournalContentProps {
  entries: JournalEntry[];
}

export function JournalContent({ entries }: JournalContentProps) {
  const router = useRouter();

  const lastEntry = entries[0];

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 w-full overflow-y-auto">
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
          {lastEntry && (
            <button
              type="button"
              onClick={() => router.push(`/journal/${lastEntry.id}`)}
              className="flex w-full cursor-pointer items-center gap-2 text-left"
            >
              <SsTypography variant="caption" className="shrink-0">
                Last entry:
              </SsTypography>
              <SsTypography
                as="span"
                className="font-mono text-sm font-semibold tracking-tight underline underline-offset-2"
              >
                {lastEntry.title} ·{" "}
                {lastEntry.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </SsTypography>
            </button>
          )}

          <JournalSearch entries={entries} />

          <div className="border-border border-b" />

          <JournalEntryForm />
        </div>
      </div>
    </div>
  );
}
