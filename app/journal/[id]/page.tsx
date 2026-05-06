import { notFound } from "next/navigation";
import { getJournalEntryById } from "@/lib/data";
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

  return <JournalEntryView entry={entry} />;
}
