"use client";
import { useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { JournalEntry } from "@/types/journal-entry";
import { SsButton } from "@/components/ui/SsButton";
import { JournalSearchBar } from "@/components/journal/JournalSearchBar";
import { JournalSearchResults } from "@/components/journal/JournalSearchResults";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";

interface JournalContentProps {
  entries: JournalEntry[];
}

export function JournalContent({ entries }: JournalContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => e.title.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-y-auto bg-white text-black">
      <div className="flex flex-1 flex-col">
        <div className="flex w-full justify-end space-x-2 p-2">
          <SsButton
            onClick={() => router.push("/dashboard")}
            variant="secondary"
            size="sm"
            aria-label="Go to dashboard"
          >
            <LayoutDashboard className="mr-1" size={16} />
          </SsButton>
          <SsButton
            onClick={() => signOut()}
            variant="secondary"
            size="sm"
          >
            Sign out
          </SsButton>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
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
    </div>
  );
}
