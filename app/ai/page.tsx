import AIChat from "@/components/AIChat";
import { getJournalEntries, getStreaks } from "@/lib/data";

export default async function AIPage() {
  // The assistant answers from this data, so the composer says up front what it
  // can actually see — an empty chat that names its context is a lot easier to
  // trust than one that just says "ready".
  const [streaks, journal] = await Promise.all([
    getStreaks(),
    getJournalEntries(),
  ]);

  const checkIns = streaks.reduce(
    (total, streak) => total + streak.entries.length,
    0
  );

  return (
    <AIChat
      contextLabel={`${streaks.length} ${
        streaks.length === 1 ? "STREAK" : "STREAKS"
      } / ${checkIns + journal.length} ENTRIES`}
    />
  );
}
