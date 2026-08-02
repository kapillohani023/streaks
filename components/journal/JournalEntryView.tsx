"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/journal-entry";
import { deleteJournalEntry } from "@/app/actions/journal";
import { SsCard } from "@/components/ui/SsCard";
import { SsMenu } from "@/components/ui/SsMenu";
import { SsTypography } from "@/components/ui/SsTypography";
import { PageHeader, PageShell } from "@/components/shared/PageShell";
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
