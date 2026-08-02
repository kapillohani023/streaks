export interface JournalEntry {
  id: string;
  title: string;
  entry: string;
  createdAt: Date;
}

/** A journal entry without its body — enough to mark and link a calendar day. */
export type JournalDay = Omit<JournalEntry, "entry">;
