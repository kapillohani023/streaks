import "server-only";

const apiUrl = process.env.T2A_API_URL;
const apiToken = process.env.T2A_API_BEARER_TOKEN;

const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;
const FALLBACK_MESSAGE =
  "Something went wrong. Please try again later.";

function formatHistory(
  history: { role: "user" | "model"; content: string }[]
): string {
  return history
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
    .join("\n");
}

async function callT2A(message: string, userId: string): Promise<string> {
  if (!apiUrl || !apiToken) {
    throw new Error("T2A_API_URL or T2A_API_BEARER_TOKEN is not set");
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        // userId is forwarded so the agent can scope its MCP streak tools to
        // the current user (the tools take a userId argument).
        body: JSON.stringify({ message, userId }),
      });

      if (!response.ok) {
        throw new Error(`T2A request failed with status ${response.status}`);
      }

      const data = (await response.json()) as { agent?: unknown };
      if (typeof data.agent !== "string" || data.agent.length === 0) {
        throw new Error("T2A response malformed: missing 'agent' string");
      }

      return data.agent;
    } catch (error) {
      lastError = error;
      console.error(`T2A attempt ${attempt} failed:`, error);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) =>
          setTimeout(r, RETRY_BASE_DELAY_MS * attempt)
        );
      }
    }
  }

  throw lastError ?? new Error("T2A request failed");
}

export async function generateAIResponse(prompt: string, userId: string) {
  try {
    return await callT2A(prompt, userId);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return FALLBACK_MESSAGE;
  }
}

export async function chatCompletion(
  history: { role: "user" | "model"; content: string }[],
  message: string,
  userId: string
) {
  try {
    const formatted = history.length
      ? `${formatHistory(history)}\nUser: ${message}`
      : message;
    return await callT2A(formatted, userId);
  } catch {
    return FALLBACK_MESSAGE;
  }
}

export async function* chatCompletionStream(
  history: { role: "user" | "model"; content: string }[],
  message: string,
  userId: string
) {
  const formatted = history.length
    ? `${formatHistory(history)}\nUser: ${message}`
    : message;
  try {
    const reply = await callT2A(formatted, userId);
    yield reply;
  } catch (error) {
    console.error("AI Stream Error:", error);
    yield FALLBACK_MESSAGE;
  }
}
