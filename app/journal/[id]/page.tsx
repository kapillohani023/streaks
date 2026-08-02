import { notFound } from "next/navigation";
import { getAdjacentJournalEntries, getJournalEntryById } from "@/lib/data";
import { JournalEntryView } from "@/components/journal/JournalEntryView";

interface JournalEntryPageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalEntryPage({
  params,
}: JournalEntryPageProps) {
  const { id } = await params;
  const entry = await getJournalEntryById(id);

  if (!entry) {
    notFound();
  }

  const { newer, older } = await getAdjacentJournalEntries(entry);

  return <JournalEntryView entry={entry} newer={newer} older={older} />;
}
