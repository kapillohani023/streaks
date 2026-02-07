"use client";
import { useState, useRef, useEffect } from "react";
import { chatCompletion } from "@/lib/ai";
import { SendHorizontal } from "lucide-react";
import { Streak } from "@/types/streak";
import { useCurrentUser } from "@/hooks/use-current-user";
import ReactMarkdown from "react-markdown";
import { SsButton } from "@/components/ui/SsButton";
import { SsInput } from "@/components/ui/SsInput";

interface Message {
  role: "user" | "model";
  content: string;
}

interface Chip {
  id: string;
  label: string;
  prompt: string;
}

interface AIChatProps {
  initialStreaks: Streak[];
}

export default function AIChat({ initialStreaks }: AIChatProps) {
  const currentUser = useCurrentUser();
  const currentUserFirstName = currentUser?.name?.split(" ")[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chips, setChips] = useState<Chip[]>([
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
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    let streaksContext = "";
    if (messages.length === 0) {
      const cleanStreaksData = initialStreaks.map((streak) => {
        return {
          name: streak.name,
          description: streak.description,
          startDate: streak.startDate,
          entries: streak.entries.map((entry) => {
            return {
              date: entry.date,
              note: entry.note,
            };
          }),
        };
      });
      streaksContext =
        "\n<context>" + JSON.stringify(cleanStreaksData) + "</context>";
    }
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatCompletion(messages, text + streaksContext);
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I encountered an error." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onChipClick = (chipId: string) => {
    const chip = chips.find((c) => c.id === chipId);
    if (chip) {
      handleSend(chip.prompt);
      setChips((prev) => prev.filter((c) => c.id !== chipId));
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col p-4 overflow-y-scroll bg-white text-black">
      <div className="mb-4 flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 && (
          <div className="mt-10 text-center text-gray-400">
            Hey, {currentUserFirstName}. What&apos;s on the agenda today?
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                ? "rounded-br-none bg-black text-white"
                : "rounded-bl-none bg-gray-100 text-black"
                }`}
            >
              {msg.role === "model" ? (
                <ReactMarkdown
                  components={{
                    ul: ({ ...props }) => (
                      <ul className="mb-2 list-disc pl-4" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="mb-2 list-decimal pl-4" {...props} />
                    ),
                    li: ({ ...props }) => <li className="mb-1" {...props} />,
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
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-none bg-gray-100 px-4 py-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-75"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chips.length > 0 && messages.length == 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <SsButton
              key={chip.id}
              onClick={() => onChipClick(chip.id)}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:border-black"
            >
              {chip.label}
            </SsButton>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <SsInput
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-200 px-4 focus:border-black"
          disabled={isLoading}
          fullWidth={false}
          containerClassName="min-w-0 flex-1"
        />
        <SsButton
          onClick={() => handleSend(input)}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="rounded-full transition-opacity hover:opacity-80"
        >
          <SendHorizontal className="h-5 w-5" />
        </SsButton>
      </div>
    </div>
  );
}
