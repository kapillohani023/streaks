"use client";
import Link from "next/link";
import { JournalEntry } from "@/types/journal-entry";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";

interface JournalSearchResultsProps {
  entries: JournalEntry[];
}

export function JournalSearchResults({ entries }: JournalSearchResultsProps) {
  if (entries.length === 0) {
    return (
      <SsCard
        variant="elevated"
        padding="md"
        className="text-center"
        style={{ backgroundColor: "var(--card)" }}
      >
        <SsTypography variant="muted">No matching entries.</SsTypography>
      </SsCard>
    );
  }

  return (
    <SsCard
      variant="elevated"
      padding="none"
      className="overflow-hidden"
      style={{ backgroundColor: "var(--card)" }}
    >
      <ul className="max-h-80 overflow-y-auto">
        {entries.map((entry, idx) => (
          <li
            key={entry.id}
            className={idx > 0 ? "border-t border-border" : ""}
          >
            <Link
              href={`/journal/${entry.id}`}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <SsTypography
                as="span"
                className="font-mono text-base font-semibold tracking-tight"
              >
                {entry.title}
              </SsTypography>
              <SsTypography variant="caption">
                {entry.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </SsTypography>
            </Link>
          </li>
        ))}
      </ul>
    </SsCard>
  );
}
