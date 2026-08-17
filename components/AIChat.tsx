"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowDown, SendHorizontal, Square, SquarePen } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import ReactMarkdown from "react-markdown";
import { SsButton } from "@/components/ui/SsButton";
import { SsGrowTextarea } from "@/components/ui/SsGrowTextarea";
import { MonoLabel } from "@/components/ui/SsMono";
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
    label: "ANALYZE PERFORMANCE",
    prompt: "Analyze my streak performance",
  },
  {
    id: "2",
    label: "WEEKLY REVIEW",
    prompt: "Give me a weekly review",
  },
  {
    id: "3",
    label: "SUGGEST GOALS",
    prompt: "Suggest some new habit goals for me",
  },
];

interface AIChatProps {
  /** What the assistant can see, e.g. "4 STREAKS / 234 ENTRIES". */
  contextLabel?: string;
}

export default function AIChat({ contextLabel }: AIChatProps) {
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

  const isEmpty = messages.length === 0;

  return (
    <div className="text-foreground flex h-full min-h-0 w-full flex-col">
      {/* The composer has to stay pinned, so this page owns its own scroll
          shell rather than PageShell's — but it borrows the same track. */}
      <div className="border-hair shrink-0 border-b">
        <div className={`mx-auto w-full px-5 pt-5 pb-3.5 ${PAGE_WIDTH.wide}`}>
          <PageHeader
            eyebrow="COPILOT"
            title="Assistant"
            actions={
              <SsButton
                onClick={handleNewChat}
                disabled={isEmpty}
                variant="outline"
                mono
                size="sm"
                leftIcon={<SquarePen size={13} />}
              >
                New chat
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
            className={`mx-auto flex w-full flex-col gap-3.5 px-5 py-6 ${PAGE_WIDTH.narrow}`}
          >
            {isEmpty && (
              <div className="mt-12 flex flex-col items-center gap-2 text-center">
                <span className="bg-foreground ss-animate-pulse-dot h-2 w-2 rounded-full" />
                <MonoLabel as="span" size="readout" tone="soft">
                  READY{contextLabel ? ` · CONTEXT: ${contextLabel}` : ""}
                </MonoLabel>
                <span className="text-dim text-sm">
                  {currentUserFirstName
                    ? `Hey, ${currentUserFirstName}. What's on the agenda today?`
                    : "What's on the agenda today?"}
                </span>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`ss-animate-scale-in max-w-[82%] rounded-[10px] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background"
                      : "border-border bg-panel text-fg-soft border"
                  }`}
                >
                  {msg.role === "model" ? (
                    msg.content === "" ? (
                      <div
                        className="flex items-center gap-1 py-1"
                        aria-label="Assistant is typing"
                      >
                        <span className="bg-soft ss-animate-bounce h-1.5 w-1.5 rounded-full [animation-delay:-0.3s]" />
                        <span className="bg-soft ss-animate-bounce h-1.5 w-1.5 rounded-full [animation-delay:-0.15s]" />
                        <span className="bg-soft ss-animate-bounce h-1.5 w-1.5 rounded-full" />
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
                            <strong
                              className="text-foreground font-semibold"
                              {...props}
                            />
                          ),
                          code: ({ ...props }) => (
                            <code
                              className="bg-sunken rounded px-1 py-0.5 font-mono text-[13px]"
                              {...props}
                            />
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
            variant="icon"
            aria-label="Scroll to latest message"
            title="Scroll to latest message"
            className="ss-animate-fade-in absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-[var(--shadow-menu)]"
          >
            <ArrowDown size={17} />
          </SsButton>
        )}
      </div>

      <div className="border-hair shrink-0 border-t bg-[var(--bg-blur)] backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className={`mx-auto w-full px-5 py-3.5 ${PAGE_WIDTH.narrow}`}
        >
          {chips.length > 0 && isEmpty && (
            <div className="mb-3 flex flex-wrap justify-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onChipClick(chip.id)}
                  className="border-border bg-panel text-soft hover:border-foreground hover:text-foreground cursor-pointer rounded-md border px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] transition-colors duration-150"
                >
                  {chip.label}
                </button>
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
              placeholder="Ask about your streaks…"
              rows={1}
              minHeight={46}
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
                className="h-[46px] w-[46px] shrink-0"
              >
                <Square size={15} className="fill-current" />
              </SsButton>
            ) : (
              <SsButton
                type="submit"
                disabled={!input.trim()}
                size="icon"
                aria-label="Send message"
                title="Send message"
                className="h-[46px] w-[46px] shrink-0"
              >
                <SendHorizontal size={18} />
              </SsButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
