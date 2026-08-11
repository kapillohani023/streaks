"use client";
import { useState, useRef, useEffect } from "react";
import {
  ArrowDown,
  SendHorizontal,
  Sparkles,
  Square,
  SquarePen,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import ReactMarkdown from "react-markdown";
import { SsButton } from "@/components/ui/SsButton";
import { SsGrowTextarea } from "@/components/ui/SsGrowTextarea";
import { PAGE_WIDTH, PageHeader } from "@/components/shared/PageShell";

interface Message {
  role: "user" | "model";
  content: string;
}

interface Chip {
  id: string;
  label: string;
  prompt: string;
}

/** How close to the bottom still counts as "following along", in px. */
const PINNED_THRESHOLD = 80;

const INITIAL_CHIPS: Chip[] = [
  {
    id: "1",
    label: "Analyze Performance",
    prompt: "Analyze my streak performance",
  },
  {
    id: "2",
    label: "Get Motivation",
    prompt: "Give me some motivation to keep my streak",
  },
  {
    id: "3",
    label: "Suggest Goals",
    prompt: "Suggest some new habit goals for me",
  },
];

export default function AIChat() {
  const currentUser = useCurrentUser();
  const currentUserFirstName = currentUser?.name?.split(" ")[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chips, setChips] = useState<Chip[]>(INITIAL_CHIPS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /**
   * Autoscroll only while the reader is actually at the bottom. Scrolling up
   * mid-answer to re-read something detaches the view until they come back.
   */
  const [isPinned, setIsPinned] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setIsPinned(
      el.scrollHeight - el.scrollTop - el.clientHeight < PINNED_THRESHOLD
    );
  };

  const scrollToBottom = (smooth: boolean) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  };

  useEffect(() => {
    if (!isPinned) return;
    // Streaming appends a chunk at a time; a smooth scroll per chunk would
    // stack dozens of competing animations, so only animate once it settles.
    scrollToBottom(!isLoading);
  }, [messages, isLoading, isPinned]);

  const handleSend = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmedText };
    const historySnapshot = [...messages];
    setMessages((prev) => [...prev, userMsg, { role: "model", content: "" }]);
    setInput("");
    setIsLoading(true);
    setIsPinned(true);
    inputRef.current?.focus();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historySnapshot,
          message: trimmedText,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedAnyChunk = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        receivedAnyChunk = true;
        setMessages((prev) => {
          const next = [...prev];
          const modelIndex = next.length - 1;
          if (next[modelIndex]?.role === "model") {
            next[modelIndex] = {
              ...next[modelIndex],
              content: next[modelIndex].content + chunk,
            };
          }
          return next;
        });
      }

      if (!receivedAnyChunk) {
        setMessages((prev) => {
          const next = [...prev];
          const modelIndex = next.length - 1;
          if (next[modelIndex]?.role === "model") {
            next[modelIndex] = {
              ...next[modelIndex],
              content: "Sorry, I am having trouble connecting right now.",
            };
          }
          return next;
        });
      }
    } catch (error) {
      // A stop is a deliberate choice, not a failure: keep whatever streamed in
      // and drop the bubble entirely if nothing arrived before the abort.
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "model" && last.content === "") {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } else {
        console.error(error);
        setMessages((prev) => {
          const next = [...prev];
          const modelIndex = next.length - 1;
          if (next[modelIndex]?.role === "model") {
            next[modelIndex] = {
              ...next[modelIndex],
              content: "Sorry, I encountered an error.",
            };
          }
          return next;
        });
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleNewChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setChips(INITIAL_CHIPS);
    setIsPinned(true);
    inputRef.current?.focus();
  };

  const onChipClick = (chipId: string) => {
    const chip = chips.find((c) => c.id === chipId);
    if (chip) {
      handleSend(chip.prompt);
      setChips((prev) => prev.filter((c) => c.id !== chipId));
    }
  };

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 w-full flex-col">
      {/* The composer has to stay pinned, so this page owns its own scroll
          shell rather than PageShell's — but it borrows the same track. */}
      <div className="border-border shrink-0 border-b">
        <div className={`mx-auto w-full px-4 pt-4 pb-3 ${PAGE_WIDTH.wide}`}>
          <PageHeader
            icon={<Sparkles size={20} />}
            title="Assistant"
            subtitle="Ask about your streaks, habits and progress"
            actions={
              <SsButton
                onClick={handleNewChat}
                disabled={messages.length === 0}
                size="icon"
                variant="ghost"
                aria-label="New chat"
                title="New chat"
                className="rounded-full"
              >
                <SquarePen className="h-5 w-5" />
              </SsButton>
            }
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className={`mx-auto w-full space-y-4 px-4 py-6 ${PAGE_WIDTH.narrow}`}
          >
            {messages.length === 0 && (
              <div className="text-muted-foreground mt-10 text-center">
                Hey, {currentUserFirstName}. What&apos;s on the agenda today?
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`ss-animate-scale-in max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.role === "model" ? (
                    msg.content === "" ? (
                      <div
                        className="flex items-center gap-1 py-1"
                        aria-label="Assistant is typing"
                      >
                        <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                        <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                        <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" />
                      </div>
                    ) : (
                      <ReactMarkdown
                        components={{
                          ul: ({ ...props }) => (
                            <ul className="mb-2 list-disc pl-4" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="mb-2 list-decimal pl-4" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          strong: ({ ...props }) => (
                            <strong className="font-semibold" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {!isPinned && messages.length > 0 && (
          <SsButton
            onClick={() => {
              setIsPinned(true);
              scrollToBottom(true);
            }}
            size="icon"
            variant="secondary"
            aria-label="Scroll to latest message"
            title="Scroll to latest message"
            className="ss-animate-fade-in absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
          >
            <ArrowDown className="h-5 w-5" />
          </SsButton>
        )}
      </div>

      <div className="border-border bg-background/80 shrink-0 border-t backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className={`mx-auto w-full px-4 py-3 ${PAGE_WIDTH.narrow}`}
        >
          {chips.length > 0 && messages.length === 0 && (
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {chips.map((chip) => (
                <SsButton
                  key={chip.id}
                  type="button"
                  onClick={() => onChipClick(chip.id)}
                  variant="secondary"
                  size="sm"
                  className="border-border hover:border-foreground rounded-full border px-3 py-1 text-sm"
                >
                  {chip.label}
                </SsButton>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <SsGrowTextarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Shift+Enter writes a newline; an in-flight IME composition
                // owns Enter until the candidate is committed.
                if (
                  e.key !== "Enter" ||
                  e.shiftKey ||
                  e.nativeEvent.isComposing
                ) {
                  return;
                }
                e.preventDefault();
                handleSend(input);
              }}
              placeholder="Type a message..."
              rows={1}
              minHeight={50}
              maxHeight={200}
              resizable={false}
              className="min-w-0 flex-1"
            />
            {isLoading ? (
              <SsButton
                type="button"
                onClick={handleStop}
                size="icon"
                aria-label="Stop generating"
                title="Stop generating"
                className="shrink-0 rounded-full"
              >
                <Square className="h-4 w-4 fill-current" />
              </SsButton>
            ) : (
              <SsButton
                type="submit"
                disabled={!input.trim()}
                size="icon"
                aria-label="Send message"
                title="Send message"
                className="shrink-0 rounded-full"
              >
                <SendHorizontal className="h-5 w-5" />
              </SsButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
