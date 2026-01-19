import { Trash2 } from "lucide-react";

interface DeleteStreakButtonProps {
  streakId: string;
  handleDelete: (streakId: string) => void;
}

export function DeleteStreakButton({
  streakId,
  handleDelete,
}: DeleteStreakButtonProps) {
  return (
    <button
      onClick={() => handleDelete(streakId)}
      className="cursor-pointer p-2 text-zinc-600 transition-colors hover:text-black"
      aria-label="Delete streak"
    >
      <Trash2 size={20} />
    </button>
  );
}
