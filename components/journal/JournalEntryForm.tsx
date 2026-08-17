"use client";
import { useState } from "react";
import { Expand } from "lucide-react";
import { addJournalEntry } from "@/app/actions/journal";
import { SsButton } from "@/components/ui/SsButton";
import { SsGrowTextarea } from "@/components/ui/SsGrowTextarea";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { MonoLabel } from "@/components/ui/SsMono";
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

      <div className="border-border bg-panel flex flex-col gap-3 rounded-xl border p-4.5">
        <div className="flex items-center justify-between gap-3">
          <MonoLabel as="span" size="readout" tone="soft">
            NEW ENTRY /{" "}
            <span className="text-foreground font-bold">{todayTitle}</span>
          </MonoLabel>
          <div className="flex items-center gap-2">
            <MonoLabel as="span" size="tile" className="tracking-[0.08em]">
              {words}W
            </MonoLabel>
            <SsButton
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setZenOpen(true)}
              disabled={isSubmitting}
              aria-label="Zen mode"
              title="Zen mode"
            >
              <Expand size={14} />
            </SsButton>
          </div>
        </div>

        <SsGrowTextarea
          id="journal-entry"
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          placeholder="What's on your mind today?"
          minHeight={170}
          maxHeight={560}
          disabled={isSubmitting}
          aria-label={`Journal entry for ${todayTitle}`}
        />

        <div className="flex justify-end gap-2.5">
          <SsButton
            type="button"
            variant="outline"
            mono
            onClick={() => setEntry("")}
            disabled={!entry || isSubmitting}
          >
            Clear
          </SsButton>
          <SsButton
            type="button"
            mono
            onClick={save}
            disabled={!entry.trim() || isSubmitting}
          >
            Save entry
          </SsButton>
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
