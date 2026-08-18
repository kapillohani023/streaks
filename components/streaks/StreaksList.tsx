import { Streak } from "@/types/streak";
import { MonoLabel } from "@/components/ui/SsMono";
import { SsTypography } from "@/components/ui/SsTypography";
import {
  REGISTRY_COLUMNS,
  StreakListItem,
} from "@/components/streaks/StreakListItem";

interface StreaksListProps {
  streaks: Streak[];
  onStreakClick: (streakId: string) => void;
  onDelete: (streakId: string) => Promise<void> | void;
}

const HEADINGS = [
  { label: "STREAK", align: "" },
  { label: "LAST 14 DAYS", align: "" },
  { label: "CURRENT", align: "text-right" },
  { label: "BEST", align: "text-right" },
  { label: "STATUS", align: "text-right" },
];

export function StreaksList({
  streaks,
  onStreakClick,
  onDelete,
}: StreaksListProps) {
  if (streaks.length === 0) {
    return (
      <div className="border-border rounded-xl border border-dashed px-6 py-12 text-center">
        <SsTypography variant="muted">
          Nothing tracked yet. Add a streak and the chain starts today.
        </SsTypography>
      </div>
    );
  }

  return (
    /*
      No `overflow-hidden` here: it clipped every row's action menu at the
      panel edge. The corners the clip used to round are rounded on the rows
      themselves instead - the top one only below `md`, where the column-header
      row is hidden and the first streak sits against the panel's top edge.
    */
    <div className="border-border bg-panel rounded-xl border [&>*:last-child]:rounded-b-xl [&>*:nth-child(2)]:rounded-t-xl md:[&>*:nth-child(2)]:rounded-t-none">
      {/* The column labels only exist where there are columns; below md the
          rows are self-labelling and a header would just be a stray line. */}
      <div
        className={`border-divider hidden gap-3 border-b px-4.5 py-2.5 md:grid md:items-center ${REGISTRY_COLUMNS}`}
      >
        {HEADINGS.map((heading) => (
          <MonoLabel
            key={heading.label}
            as="span"
            size="micro"
            className={`tracking-[0.16em] ${heading.align}`}
          >
            {heading.label}
          </MonoLabel>
        ))}
        <span />
      </div>

      {streaks.map((streak) => (
        <StreakListItem
          key={streak.id}
          streak={streak}
          onStreakClick={onStreakClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
