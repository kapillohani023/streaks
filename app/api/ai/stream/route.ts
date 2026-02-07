import { auth } from "@/app/auth";
import { chatCompletionStream } from "@/lib/ai";

interface StreamRequestBody {
  history: { role: "user" | "model"; content: string }[];
  message: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: StreamRequestBody;
  try {
    body = (await request.json()) as StreamRequestBody;
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return new Response("Message is required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of chatCompletionStream(history, message)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error("Streaming chat error:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
