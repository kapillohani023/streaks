"use client";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/journal-entry";
import { deleteJournalEntry } from "@/app/actions/journal";
import { SsButton } from "@/components/ui/SsButton";
import { SsCard } from "@/components/ui/SsCard";
import { SsMenu } from "@/components/ui/SsMenu";
import { SsTypography } from "@/components/ui/SsTypography";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
import { DeleteJournalEntryDialog } from "@/components/journal/DeleteJournalEntryDialog";
import { countWords } from "@/lib/util";

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
      <PageHeader
        onBack={() => router.push("/journal")}
        backLabel="Back to journal"
        title={entry.title}
        titleClassName="font-mono tracking-tight"
        subtitle={`${entry.createdAt.toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })} · ${words} ${words === 1 ? "word" : "words"}`}
        actions={
          <>
            <SsButton
              variant="ghost"
              size="icon"
              onClick={() => goTo(newer)}
              disabled={!newer}
              aria-label={
                newer ? `Newer entry: ${newer.title}` : "No newer entry"
              }
              title={newer?.title}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <ChevronLeft size={20} />
            </SsButton>
            <SsButton
              variant="ghost"
              size="icon"
              onClick={() => goTo(older)}
              disabled={!older}
              aria-label={
                older ? `Older entry: ${older.title}` : "No older entry"
              }
              title={older?.title}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <ChevronRight size={20} />
            </SsButton>
            <SsMenu
              label={`Actions for ${entry.title}`}
              items={[
                {
                  label: "Delete",
                  icon: <Trash2 size={16} />,
                  danger: true,
                  onSelect: () => setDeleteOpen(true),
                },
              ]}
            />
          </>
        }
      />

      <SsCard variant="default" padding="lg">
        <SsTypography
          variant="body"
          className="leading-relaxed whitespace-pre-wrap"
        >
          {entry.entry}
        </SsTypography>
      </SsCard>

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
