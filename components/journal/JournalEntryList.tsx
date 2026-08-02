"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { JournalEntry } from "@/types/journal-entry";
import { deleteJournalEntry } from "@/app/actions/journal";
import { SsMenu } from "@/components/ui/SsMenu";
import { SsTypography } from "@/components/ui/SsTypography";
import { DeleteJournalEntryDialog } from "@/components/journal/DeleteJournalEntryDialog";
import { JournalSearchBar } from "@/components/journal/JournalSearchBar";

interface JournalEntryListProps {
  entries: JournalEntry[];
}

const PREVIEW_LENGTH = 120;

const preview = (text: string) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > PREVIEW_LENGTH
    ? `${flat.slice(0, PREVIEW_LENGTH)}…`
    : flat;
};

const monthLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export function JournalEntryList({ entries }: JournalEntryListProps) {
  const [pendingDelete, setPendingDelete] = useState<JournalEntry | null>(null);
  const [query, setQuery] = useState("");

  // Entries are plain text, so the body is searchable alongside the date title.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.entry.toLowerCase().includes(q)
    );
  }, [entries, query]);

  // Entries arrive newest-first, so a single pass keeps the months in order.
  const months = useMemo(() => {
    const groups: Array<{ label: string; entries: JournalEntry[] }> = [];
    for (const entry of filtered) {
      const label = monthLabel(entry.createdAt);
      const current = groups[groups.length - 1];
      if (current?.label === label) current.entries.push(entry);
      else groups.push({ label, entries: [entry] });
    }
    return groups;
  }, [filtered]);

  if (entries.length === 0) {
    return (
      <div className="border-border rounded-2xl border border-dashed px-6 py-10 text-center">
        <SsTypography variant="muted">
          No entries yet. Whatever you write above shows up here.
        </SsTypography>
      </div>
    );
  }

  const isFiltering = query.trim().length > 0;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <JournalSearchBar value={query} onChange={setQuery} />
          {isFiltering && (
            <SsTypography variant="caption" className="px-1">
              {filtered.length}{" "}
              {filtered.length === 1 ? "entry matches" : "entries match"}{" "}
              &ldquo;
              {query.trim()}&rdquo;
            </SsTypography>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="border-border rounded-2xl border border-dashed px-6 py-10 text-center">
            <SsTypography variant="muted">
              No entries match your search.
            </SsTypography>
          </div>
        )}

        {months.map((month) => (
          <section key={month.label} className="flex flex-col gap-2">
            <SsTypography
              as="h3"
              variant="label"
              className="px-1 text-xs tracking-widest uppercase"
            >
              {month.label}
            </SsTypography>
            {/* No overflow-hidden here: it would clip each row's actions menu. */}
            <ul className="border-border bg-card rounded-2xl border">
              {month.entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className={[
                    "hover:bg-muted/60 flex items-center gap-2 pr-2 transition-colors duration-150",
                    index > 0 ? "border-border border-t" : "rounded-t-2xl",
                    index === month.entries.length - 1 ? "rounded-b-2xl" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Link
                    href={`/journal/${entry.id}`}
                    className="focus-visible:ring-ring flex min-w-0 flex-1 flex-col gap-1 rounded-l-2xl px-4 py-3 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="text-card-foreground font-mono text-sm font-semibold tracking-tight">
                        {entry.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {entry.createdAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <span className="text-muted-foreground truncate text-sm">
                      {preview(entry.entry)}
                    </span>
                  </Link>
                  <SsMenu
                    label={`Actions for ${entry.title}`}
                    items={[
                      {
                        label: "Delete",
                        icon: <Trash2 size={16} />,
                        danger: true,
                        onSelect: () => setPendingDelete(entry),
                      },
                    ]}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <DeleteJournalEntryDialog
        open={pendingDelete !== null}
        entryTitle={pendingDelete?.title}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteJournalEntry(pendingDelete.id);
        }}
      />
    </>
  );
}
