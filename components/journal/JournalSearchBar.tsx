"use client";
import { Search, X } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";

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
        size={18}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search by title (e.g., 02-MAY-2026)"
        className="w-full rounded border-2 border-black bg-white py-2 pr-10 pl-10 text-base text-black transition-colors focus:ring-2 focus:ring-black focus:outline-none"
      />
      {value && (
        <SsButton
          type="button"
          variant="icon"
          size="icon"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
        >
          <X size={16} />
        </SsButton>
      )}
    </div>
  );
}
