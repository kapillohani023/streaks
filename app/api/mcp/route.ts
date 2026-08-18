import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  getStreaksForUser,
  getStreakEntriesForUser,
  createStreakForUser,
  markStreakCompletedTodayForUser,
  isStreakCompletedTodayForUser,
  setStreakReminderForUser,
  hasPushSubscription,
} from "@/lib/streak-service";
import {
  getTodosForUser,
  createTodoForUser,
  setTodoStageForUser,
  deleteTodoForUser,
} from "@/lib/todo-service";
import { TODO_TEXT_MAX, TodoStageSchema, stageDef } from "@/types/todo";

export const runtime = "nodejs";

// MCP tool results are plain text blocks; JSON-encode payloads so the model
// gets structured data it can reason over.
function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "fetch_streaks",
      "List all of a user's streaks (id, name, description, startDate). Does not include daily entries — call fetch_streak_entries for a streak's history.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
      },
      async ({ userId }) => {
        try {
          const streaks = await getStreaksForUser(userId);
          return ok(
            streaks.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              startDate: s.startDate.toISOString(),
              reminderEnabled: s.reminderEnabled,
              reminderTime: s.reminderTime ?? null,
            }))
          );
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "fetch_streak_entries",
      "List the entries (dates, completion, notes) for one streak the user owns.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        streakId: z
          .string()
          .describe("The id of the streak to fetch entries for"),
      },
      async ({ userId, streakId }) => {
        try {
          const entries = await getStreakEntriesForUser(userId, streakId);
          return ok(
            entries.map((e) => ({
              id: e.id,
              date: e.date.toISOString(),
              completed: e.completed,
              note: e.note ?? null,
            }))
          );
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "create_streak",
      "Create a new streak for the user.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        name: z.string().describe("Short name of the habit/streak"),
        description: z
          .string()
          .optional()
          .describe("Optional description; defaults to empty"),
        startDate: z
          .string()
          .optional()
          .describe("ISO 8601 date the streak starts; defaults to today"),
      },
      async ({ userId, name, description, startDate }) => {
        try {
          const streak = await createStreakForUser(userId, {
            name,
            description,
            startDate,
          });
          return ok({
            id: streak.id,
            name: streak.name,
            description: streak.description,
            startDate: streak.startDate.toISOString(),
          });
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "mark_streak_completed_today",
      "Mark a streak the user owns as done for TODAY only (not for arbitrary past dates). " +
        "Safe to call more than once: if today is already marked completed, no duplicate " +
        "entry is created and the existing entry is returned instead — the response's " +
        "`alreadyCompleted` field tells you which happened. Use `is_streak_completed_today` " +
        "first if you only need to check status without writing anything.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        streakId: z
          .string()
          .describe("The id of the streak to mark completed for today"),
        note: z
          .string()
          .optional()
          .describe("Optional note to attach to today's entry"),
      },
      async ({ userId, streakId, note }) => {
        try {
          const { alreadyCompleted, entry } =
            await markStreakCompletedTodayForUser(userId, { streakId, note });
          return ok({
            alreadyCompleted,
            entry: {
              id: entry.id,
              streakId: entry.streakId,
              date: entry.date.toISOString(),
              completed: entry.completed,
              note: entry.note ?? null,
            },
          });
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "is_streak_completed_today",
      "Check whether a streak the user owns has already been marked completed for TODAY. " +
        "Returns a plain boolean (`completedToday`) — use this before " +
        "`mark_streak_completed_today` when you just need to know the status, e.g. to " +
        "answer 'did I do X today?' or to decide whether to prompt the user.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        streakId: z.string().describe("The id of the streak to check"),
      },
      async ({ userId, streakId }) => {
        try {
          const completedToday = await isStreakCompletedTodayForUser(
            userId,
            streakId
          );
          return ok({ completedToday });
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "set_streak_reminder",
      "Turn a streak's daily push reminder on or off, or change its time. " +
        "`time` is the user's LOCAL wall-clock time in 24h HH:MM (their timezone " +
        "is stored on their account — do not convert to UTC) and is required when " +
        "enabling. Note this only records the preference: notifications are " +
        "delivered to devices the user has separately granted permission on. If " +
        "the response's `hasDevice` is false, tell the user plainly that nothing " +
        "will arrive until they enable notifications in the Streaks app on a device.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        streakId: z.string().describe("The id of the streak to configure"),
        enabled: z
          .boolean()
          .describe("Whether the daily reminder should be active"),
        time: z
          .string()
          .optional()
          .describe(
            'Local reminder time as 24h HH:MM, e.g. "07:30". Required when enabled is true.'
          ),
      },
      async ({ userId, streakId, enabled, time }) => {
        try {
          const streak = await setStreakReminderForUser(userId, {
            streakId,
            enabled,
            time,
          });
          const hasDevice = await hasPushSubscription(userId);
          return ok({
            reminderEnabled: streak.reminderEnabled,
            reminderTime: streak.reminderTime,
            hasDevice,
            warning:
              enabled && !hasDevice
                ? "Saved, but this user has no device registered for notifications, so the reminder will not be delivered yet."
                : null,
          });
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "fetch_todos",
      "List every todo on the user's board, in board order. Each item carries a " +
        "`stage` of `todo`, `doing` or `done` — shown in the app as TO DO, IN " +
        "PROGRESS and COMPLETED — plus a ready-to-read `stageLabel`. Call this " +
        "first to get the `id` for `set_todo_stage` or `delete_todo`; ids are " +
        "opaque and never guessable from the text.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
      },
      async ({ userId }) => {
        try {
          const todos = await getTodosForUser(userId);
          return ok(
            todos.map((t) => ({
              id: t.id,
              text: t.text,
              stage: t.stage,
              stageLabel: stageDef(t.stage).label,
            }))
          );
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "create_todo",
      "Add a new todo to the user's board. `stage` is optional and defaults to " +
        "`todo` (TO DO), which is almost always right — only pass `doing` when " +
        "the user says they have already started it, or `done` when they are " +
        "recording something they have already finished. One call creates one " +
        "item: for a list of tasks, call this once per task rather than " +
        "packing them into a single `text`. The new item goes to the end of " +
        "its column. Returns the created todo including its `id`.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        text: z
          .string()
          .describe(
            `The task, as the user would read it on a card. At most ${TODO_TEXT_MAX} characters.`
          ),
        stage: TodoStageSchema.optional().describe(
          "`todo` (TO DO, the default), `doing` (IN PROGRESS) or `done` (COMPLETED)"
        ),
      },
      async ({ userId, text, stage }) => {
        try {
          const trimmed = text.trim();
          if (!trimmed) throw new Error("Task text is required");
          // Rejected rather than truncated: silently storing two thirds of a
          // task is worse than saying it did not fit.
          if (trimmed.length > TODO_TEXT_MAX) {
            throw new Error(
              `Task must be ${TODO_TEXT_MAX} characters or fewer; got ${trimmed.length}`
            );
          }

          const todo = await createTodoForUser(userId, {
            text: trimmed,
            stage: stage ?? "todo",
          });
          return ok({
            id: todo.id,
            text: todo.text,
            stage: todo.stage,
            stageLabel: stageDef(todo.stage).label,
          });
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "set_todo_stage",
      "Move one todo the user owns to a stage: `doing` when they have started " +
        "it, `done` when they have finished it, or `todo` to put it back on the " +
        "pile. This is the tool for 'mark X as in progress' and 'I finished X'. " +
        "Moving to `done` does NOT delete anything — the item stays on the board " +
        "in the COMPLETED column, which is what the user expects unless they " +
        "explicitly ask to remove it. The todo lands at the end of its new " +
        "column. Safe to call when it is already in that stage; the response's " +
        "`changed` field says whether anything actually moved.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        todoId: z
          .string()
          .describe("The id of the todo to move, from `fetch_todos`"),
        stage: TodoStageSchema.describe(
          "`todo` (TO DO), `doing` (IN PROGRESS) or `done` (COMPLETED)"
        ),
      },
      async ({ userId, todoId, stage }) => {
        try {
          const { todo, previousStage, changed } = await setTodoStageForUser(
            userId,
            { id: todoId, stage }
          );
          return ok({
            id: todo.id,
            text: todo.text,
            stage: todo.stage,
            stageLabel: stageDef(todo.stage).label,
            previousStage,
            changed,
          });
        } catch (e) {
          return fail(e);
        }
      }
    );

    server.tool(
      "delete_todo",
      "Permanently remove one todo from the user's board. There is no undo and " +
        "no trash to restore from. If the user has merely finished the task, " +
        "call `set_todo_stage` with `done` instead — deleting is for items that " +
        "should never have been on the board. `deleted` comes back false when " +
        "the id matches nothing the user owns, which usually means it was " +
        "already removed.",
      {
        userId: z
          .string()
          .describe(
            "The acting user's id. Use the `userId` provided in the request input; never invent it or ask the user."
          ),
        todoId: z
          .string()
          .describe("The id of the todo to delete, from `fetch_todos`"),
      },
      async ({ userId, todoId }) => {
        try {
          const deleted = await deleteTodoForUser(userId, todoId);
          return ok({ id: todoId, deleted });
        } catch (e) {
          return fail(e);
        }
      }
    );
  },
  {},
  // Route lives at app/api/mcp/route.ts, so the endpoint is /api/mcp.
  { basePath: "/api", disableSse: true }
);

// Gate every request on a shared secret configured on the T2A agent's MCP
// server (header `x-mcp-secret`). Server-to-server trust; the acting user is
// identified by the `userId` tool argument.
async function authed(req: Request): Promise<Response> {
  const secret = process.env.MCP_SERVER_SECRET;
  if (!secret || req.headers.get("x-mcp-secret") !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return handler(req);
}

export { authed as GET, authed as POST, authed as DELETE };
