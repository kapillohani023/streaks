"use client";
import { useMemo, useState } from "react";
import { JournalEntry } from "@/types/journal-entry";
import { JournalSearchBar } from "@/components/journal/JournalSearchBar";
import { JournalSearchResults } from "@/components/journal/JournalSearchResults";

interface JournalSearchProps {
  entries: JournalEntry[];
}

export function JournalSearch({ entries }: JournalSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => e.title.toLowerCase().includes(q));
  }, [entries, query]);

  const recent = useMemo(() => entries.slice(0, 3), [entries]);

  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery || (focused && recent.length > 0);
  const results = hasQuery ? filtered : recent;

  return (
    <div className="relative">
      <JournalSearchBar
        value={query}
        onChange={setQuery}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {showResults && (
        <div className="absolute top-full right-0 left-0 z-10 mt-2">
          <JournalSearchResults entries={results} />
        </div>
      )}
    </div>
  );
}
