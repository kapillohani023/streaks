import { Trash2 } from "lucide-react";
import { SsButton } from "@/components/ui/SsButton";

interface DeleteStreakButtonProps {
  streakId: string;
  handleDelete: (streakId: string) => void;
}

export function DeleteStreakButton({
  streakId,
  handleDelete,
}: DeleteStreakButtonProps) {
  return (
    <SsButton
      onClick={() => handleDelete(streakId)}
      variant="ghost"
      size="icon"
      className="text-zinc-600 hover:text-black"
      aria-label="Delete streak"
    >
      <Trash2 size={20} />
    </SsButton>
  );
}
