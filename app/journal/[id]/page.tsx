import { notFound } from "next/navigation";
import { getJournalEntries, getJournalEntryById } from "@/lib/data";
import { JournalEntryView } from "@/components/journal/JournalEntryView";

interface JournalEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalEntryPage({
  params,
}: JournalEntryPageProps) {
  const { id } = await params;
  const [entry, entries] = await Promise.all([
    getJournalEntryById(id),
    getJournalEntries(),
  ]);

  if (!entry) {
    notFound();
  }

  return <JournalEntryView entry={entry} entries={entries} />;
}
