"use client";

import { useEffect, useRef, useState } from "react";
import { Minimize2 } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";
import { countWords } from "@/lib/util";

interface ZenWriterProps {
  open: boolean;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onExit: () => void;
  onSave: () => void;
  saving?: boolean;
}

/**
 * Full-screen writing surface: the page chrome goes away and only the text and
 * a chrome bar that fades out of the way remain.
 *
 * Draft state lives with the caller, so entering and leaving zen mode never
 * costs the writer a word.
 */
export function ZenWriter({
  open,
  title,
  value,
  onChange,
  onExit,
  onSave,
  saving = false,
}: ZenWriterProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chromeVisible, setChromeVisible] = useState(true);

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onExit();
      // Cmd/Ctrl+Enter saves without leaving the keyboard.
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (value.trim() && !saving) onSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, saving, value, onExit, onSave]);

  if (!open) return null;

  const words = countWords(value);

  return (
    <div
      className="ss-animate-fade-in bg-background fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Zen writing mode"
    >
      <div
        className="flex items-center justify-between gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 transition-opacity duration-300"
        style={{ opacity: chromeVisible ? 1 : 0.25 }}
        onMouseEnter={() => setChromeVisible(true)}
      >
        <span className="text-muted-foreground font-mono text-sm tracking-tight">
          {title}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-xs sm:inline">
            {words} {words === 1 ? "word" : "words"}
          </span>
          <SsButton
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={<Minimize2 size={16} />}
            onClick={onExit}
            disabled={saving}
          >
            Exit
          </SsButton>
          <SsButton
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!value.trim() || saving}
            loading={saving}
          >
            Save
          </SsButton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setChromeVisible(false)}
          placeholder="Just write."
          spellCheck
          disabled={saving}
          className="text-foreground placeholder:text-muted-foreground/60 h-full w-full max-w-[68ch] resize-none bg-transparent text-lg leading-[1.9] tracking-tight focus:outline-none disabled:opacity-60"
        />
      </div>

      <div
        className="text-muted-foreground pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs transition-opacity duration-300"
        style={{ opacity: chromeVisible ? 0.8 : 0.3 }}
      >
        Esc to exit · {"⌘"}/Ctrl + Enter to save
      </div>
    </div>
  );
}
