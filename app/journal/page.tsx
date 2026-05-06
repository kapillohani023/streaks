import { getJournalEntries } from "@/lib/data";
import { JournalContent } from "@/components/JournalContent";

export default async function JournalPage() {
  const entries = await getJournalEntries();
  return <JournalContent entries={entries} />;
}
