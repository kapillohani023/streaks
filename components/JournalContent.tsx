"use client";
import { useMemo, useState } from "react";
import { JournalEntry } from "@/types/journal-entry";
import { SsTypography } from "@/components/ui/SsTypography";
import { JournalSearchBar } from "@/components/journal/JournalSearchBar";
import { JournalSearchResults } from "@/components/journal/JournalSearchResults";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";

interface JournalContentProps {
  entries: JournalEntry[];
}

export function JournalContent({ entries }: JournalContentProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => e.title.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-y-auto bg-white text-black">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        <SsTypography variant="h3">Journal</SsTypography>

        <div className="relative">
          <JournalSearchBar value={query} onChange={setQuery} />
          {query.trim() && (
            <div className="absolute top-full right-0 left-0 z-10 mt-2">
              <JournalSearchResults entries={filtered} />
            </div>
          )}
        </div>

        <div className="border-b-2 border-black" />

        <JournalEntryForm />
      </div>
    </div>
  );
}
