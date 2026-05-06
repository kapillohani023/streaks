"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { addJournalEntry } from "@/app/actions/journal";
import { SsButton } from "@/components/ui/SsButton";
import { SsTextarea } from "@/components/ui/SsInput";
import { SsLoaderOverlay } from "@/components/ui/SsLoader";
import { encryptEntry, formatJournalTitle } from "@/lib/util";
import { EncryptionKeyDialog } from "@/components/journal/EncryptionKeyDialog";

export function JournalEntryForm() {
  const [entry, setEntry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const todayTitle = formatJournalTitle(new Date());

  const submit = async (text: string) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("entry", text);
    formData.set("title", formatJournalTitle(new Date()));
    await addJournalEntry(formData);
    setEntry("");
    setIsSubmitting(false);
    setKeyDialogOpen(false);
  };

  const handleKeyConfirm = async (key: string) => {
    const text = entry.trim();
    if (!text || !key) return;
    const payload = await encryptEntry(text, key);
    await submit(payload);
  };

  const handleClear = () => setEntry("");

  return (
    <>
      <SsLoaderOverlay open={isSubmitting} label="Saving entry..." />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700">
            New entry for{" "}
            <span className="font-mono text-black">{todayTitle}</span>
          </span>
        </div>
        <SsTextarea
          id="journal-entry"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="What's on your mind today?"
          rows={14}
          className="min-h-[320px]"
          disabled={isSubmitting}
        />
        <div className="flex gap-3">
          <SsButton
            type="button"
            variant="secondary"
            block
            onClick={handleClear}
            disabled={!entry || isSubmitting}
          >
            Clear
          </SsButton>
          <SsButton
            type="button"
            block
            leftIcon={<Plus size={18} />}
            onClick={() => setKeyDialogOpen(true)}
            disabled={!entry.trim() || isSubmitting}
          >
            Create Entry
          </SsButton>
        </div>
      </div>
      <EncryptionKeyDialog
        open={keyDialogOpen}
        onClose={() => setKeyDialogOpen(false)}
        onConfirm={handleKeyConfirm}
        busy={isSubmitting}
      />
    </>
  );
}
