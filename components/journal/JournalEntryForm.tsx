"use client";
import { useState } from "react";
import { Expand, Plus } from "lucide-react";
import { addJournalEntry } from "@/app/actions/journal";
import { SsButton } from "@/components/ui/SsButton";
import { SsGrowTextarea } from "@/components/ui/SsGrowTextarea";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { countWords, formatJournalTitle } from "@/lib/util";
import { ZenWriter } from "@/components/journal/ZenWriter";

export function JournalEntryForm() {
  const [entry, setEntry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zenOpen, setZenOpen] = useState(false);
  const todayTitle = formatJournalTitle(new Date());

  const save = async () => {
    const text = entry.trim();
    if (!text) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("entry", text);
      formData.set("title", formatJournalTitle(new Date()));
      await addJournalEntry(formData);
      setEntry("");
      setZenOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const words = countWords(entry);

  return (
    <>
      {/* Zen mode has its own in-place saving state; the overlay would cover it. */}
      <SsLoaderOverlay
        open={isSubmitting && !zenOpen}
        label="Saving entry..."
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm font-medium">
            New entry for{" "}
            <span className="text-foreground font-mono">{todayTitle}</span>
          </span>
          <SsButton
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Expand size={16} />}
            onClick={() => setZenOpen(true)}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            Zen mode
          </SsButton>
        </div>

        <SsGrowTextarea
          id="journal-entry"
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          placeholder="What's on your mind today?"
          minHeight={200}
          maxHeight={560}
          disabled={isSubmitting}
          aria-label={`Journal entry for ${todayTitle}`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">
            {words} {words === 1 ? "word" : "words"} · drag the corner to resize
          </span>
          <div className="flex gap-3">
            <SsButton
              type="button"
              variant="secondary"
              onClick={() => setEntry("")}
              disabled={!entry || isSubmitting}
            >
              Clear
            </SsButton>
            <SsButton
              type="button"
              leftIcon={<Plus size={18} />}
              onClick={save}
              disabled={!entry.trim() || isSubmitting}
            >
              Save entry
            </SsButton>
          </div>
        </div>
      </div>

      <ZenWriter
        open={zenOpen}
        title={todayTitle}
        value={entry}
        onChange={setEntry}
        onExit={() => setZenOpen(false)}
        onSave={save}
        saving={isSubmitting}
      />
    </>
  );
}
