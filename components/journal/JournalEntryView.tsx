"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { JournalEntry } from "@/types/journal-entry";
import { SsButton } from "@/components/ui/SsButton";
import { SsCard } from "@/components/ui/SsCard";
import { SsTypography } from "@/components/ui/SsTypography";
import { JournalSearch } from "@/components/journal/JournalSearch";
import { decryptEntry } from "@/lib/util";

interface JournalEntryViewProps {
  entry: JournalEntry;
  entries: JournalEntry[];
}

type DecryptState =
  | { status: "idle" }
  | { status: "ok"; text: string }
  | { status: "error" };

export function JournalEntryView({ entry, entries }: JournalEntryViewProps) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [state, setState] = useState<DecryptState>({ status: "idle" });

  useEffect(() => {
    if (!key) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    decryptEntry(entry.entry, key)
      .then((text) => {
        if (!cancelled) setState({ status: "ok", text });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [entry.entry, key]);

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 w-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4">
        <div className="flex items-center justify-between gap-3">
          <SsButton
            variant="icon"
            size="icon"
            onClick={() => router.push("/journal")}
            aria-label="Back to journal"
          >
            <ArrowLeft size={20} />
          </SsButton>
          <SsTypography variant="caption" className="shrink-0">
            {entry.createdAt.toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </SsTypography>
        </div>

        <JournalSearch entries={entries} />

        <SsCard variant="default" padding="lg">
          <div className="border-border mb-4 flex items-center justify-between gap-3 border-b pb-3">
            <SsTypography
              as="span"
              className="font-mono text-xl font-semibold tracking-tight"
            >
              {entry.title}
            </SsTypography>
            <div className="relative w-48 max-w-[60%]">
              <KeyRound
                size={16}
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Decryption passphrase"
                className="border-input-border bg-card text-card-foreground focus:ring-ring w-full rounded-xl border py-2 pr-3 pl-9 text-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {state.status === "idle" && (
            <SsTypography variant="muted">
              Enter the passphrase above to decrypt this entry.
            </SsTypography>
          )}
          {state.status === "error" && (
            <SsTypography variant="body" className="text-destructive">
              Wrong passphrase or corrupted entry.
            </SsTypography>
          )}
          {state.status === "ok" && (
            <SsTypography
              variant="body"
              className="leading-relaxed whitespace-pre-wrap"
            >
              {state.text}
            </SsTypography>
          )}
        </SsCard>
      </div>
    </div>
  );
}
