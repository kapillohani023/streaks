"use client";
import { Search, X } from "lucide-react";

interface JournalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function JournalSearchBar({
  value,
  onChange,
  onFocus,
  onBlur,
}: JournalSearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        size={15}
        className="text-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="grep entries…"
        aria-label="Search journal entries"
        className="border-border bg-panel text-foreground placeholder:text-faint focus:border-foreground w-full rounded-lg border py-2.5 pr-9 pl-9 font-mono text-[13px] transition-colors duration-150 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-faint hover:text-foreground absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md transition-colors duration-150"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
