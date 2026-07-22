import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  getStreaksForUser,
  getStreakEntriesForUser,
  createStreakForUser,
  markStreakCompletedTodayForUser,
  isStreakCompletedTodayForUser,
} from "@/lib/streak-service";

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
      streakId: z.string().describe("The id of the streak to fetch entries for"),
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
