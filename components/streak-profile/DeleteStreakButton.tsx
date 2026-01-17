import { Trash2 } from "lucide-react";

interface DeleteStreakButtonProps {
    streakId: string;
    handleDelete: (streakId: string) => void;
}

export function DeleteStreakButton({ streakId, handleDelete }: DeleteStreakButtonProps) {
    return (
        <button
          onClick={() => handleDelete(streakId)}
          className="text-zinc-600 hover:text-black transition-colors p-2 cursor-pointer"
          aria-label="Delete streak"
        >
          <Trash2 size={20} />
        </button>
    );
}