"use client";
import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/journal-entry";
import { deleteJournalEntry } from "@/app/actions/journal";
import { SsButton } from "@/components/ui/SsButton";
import { SsCard } from "@/components/ui/SsCard";
import { SsMenu } from "@/components/ui/SsMenu";
import { SsTypography } from "@/components/ui/SsTypography";
import { DeleteJournalEntryDialog } from "@/components/journal/DeleteJournalEntryDialog";
import { countWords } from "@/lib/util";

interface JournalEntryViewProps {
  entry: JournalEntry;
}

export function JournalEntryView({ entry }: JournalEntryViewProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const words = countWords(entry.entry);

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 w-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-10">
        <div className="flex items-center justify-between gap-3">
          <SsButton
            variant="icon"
            size="icon"
            onClick={() => router.push("/journal")}
            aria-label="Back to journal"
          >
            <ArrowLeft size={20} />
          </SsButton>
          <div className="flex items-center gap-1">
            <SsTypography variant="caption" className="shrink-0">
              {entry.createdAt.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </SsTypography>
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
          </div>
        </div>

        <SsCard variant="default" padding="lg">
          <div className="border-border mb-4 flex items-baseline justify-between gap-3 border-b pb-3">
            <SsTypography
              as="h1"
              className="font-mono text-xl font-semibold tracking-tight"
            >
              {entry.title}
            </SsTypography>
            <SsTypography variant="caption" className="shrink-0">
              {words} {words === 1 ? "word" : "words"}
            </SsTypography>
          </div>

          <SsTypography
            variant="body"
            className="leading-relaxed whitespace-pre-wrap"
          >
            {entry.entry}
          </SsTypography>
        </SsCard>
      </div>

      <DeleteJournalEntryDialog
        open={deleteOpen}
        entryTitle={entry.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteJournalEntry(entry.id);
          router.push("/journal");
        }}
      />
    </div>
  );
}
