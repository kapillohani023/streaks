import { z } from "zod";

export const TodoStageSchema = z.enum(["todo", "doing", "done"]);
export type TodoStage = z.infer<typeof TodoStageSchema>;

export const TodoSchema = z.object({
  id: z.string(),
  text: z.string(),
  stage: TodoStageSchema,
});

export type Todo = z.infer<typeof TodoSchema>;

export interface TodoStageDef {
  key: TodoStage;
  label: string;
  /** Colour of the 7px square beside the column label. */
  dot: string;
}

/**
 * The board, left to right. Order is meaningful: the bulk arrows escalate to
 * the next entry and de-escalate to the previous one, so this array *is* the
 * definition of "forward" on the board.
 *
 * The dots walk the same grey ladder as the rest of the app — --mid for
 * untouched, --heat-2 for in-flight, full --fg for done — which is why a
 * finished column reads as the brightest one without needing a colour of
 * its own.
 */
export const TODO_STAGES: readonly TodoStageDef[] = [
  { key: "todo", label: "TO DO", dot: "var(--mid)" },
  { key: "doing", label: "IN PROGRESS", dot: "var(--heat-2)" },
  { key: "done", label: "COMPLETED", dot: "var(--fg)" },
] as const;

export function stageDef(stage: TodoStage): TodoStageDef {
  return TODO_STAGES.find((d) => d.key === stage) ?? TODO_STAGES[0];
}

/** Longest task text accepted. Chips are a board, not a document. */
export const TODO_TEXT_MAX = 200;

/**
 * Where chip text is clipped for display. The chip reserves exactly two lines,
 * so anything past this would be cut mid-word by `overflow:hidden` with no
 * indication that there is more — the ellipsis says so, and the full text stays
 * available in the title attribute and the actions dialog.
 */
const CHIP_TEXT_MAX = 62;

export function chipText(text: string): string {
  return text.length > CHIP_TEXT_MAX
    ? `${text.slice(0, CHIP_TEXT_MAX - 1).trimEnd()}…`
    : text;
}
