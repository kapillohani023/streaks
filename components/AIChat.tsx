"use client"
import { useState, useRef, useEffect } from "react"
import { chatCompletion } from "@/lib/ai";
import { SendHorizontal } from "lucide-react";
import { Streak } from '@/types/Streak'
import { fetchStreaks } from "@/lib/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface Chip {
    id: string;
    label: string;
    prompt: string;
}

export default function AIChat() {
    const currentUser = useCurrentUser();
    const currentUserFirstName = currentUser?.name?.split(" ")[0];
    const [streaks, setStreaks] = useState<Streak[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chips, setChips] = useState<Chip[]>([
        { id: '1', label: 'Analyze Performance', prompt: 'Analyze my streak performance' },
        { id: '2', label: 'Get Motivation', prompt: 'Give me some motivation to keep my streak' },
        { id: '3', label: 'Suggest Goals', prompt: 'Suggest some new habit goals for me' },
    ]);


    useEffect(() => {
        const loadStreaks = async () => {
            const streaks = await fetchStreaks();
            setStreaks(streaks);
        };
        loadStreaks();
    }, []);


    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        let streaksContext = "";
        if (messages.length === 0) {
            const cleanStreaksData = streaks.map(streak => {
                return {
                    name: streak.name,
                    description: streak.description,
                    startDate: streak.startDate,
                    entries: streak.entries.map(entry => {
                        return {
                            date: entry.date,
                            note: entry.note,
                        }
                    })
                }
            }
            )
            streaksContext = "\n<context>" + JSON.stringify(cleanStreaksData) + "</context>";
        }
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await chatCompletion(messages, text + streaksContext);
            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const onChipClick = (chipId: string) => {
        const chip = chips.find(c => c.id === chipId);
        if (chip) {
            handleSend(chip.prompt);
            setChips(prev => prev.filter(c => c.id !== chipId));
        }
    };

    return (
        <div className="flex flex-col h-full bg-white text-black p-4 w-full">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.length === 0 && (
                    <div className="text-gray-400 text-center mt-10">
                        Hey, {currentUserFirstName}. What’s on the agenda today?
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                            ? 'bg-black text-white rounded-br-none'
                            : 'bg-gray-100 text-black rounded-bl-none'
                            }`}>
                            {msg.role === 'model' ? (
                                <ReactMarkdown
                                    components={{
                                        ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                        li: ({ ...props }) => <li className="mb-1" {...props} />,
                                        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                        strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
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
                        <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {(chips.length > 0 && messages.length == 0) && (
                <div className="flex justify-center flex-wrap gap-2 mb-4">
                    {chips.map(chip => (
                        <button
                            key={chip.id}
                            onClick={() => onChipClick(chip.id)}
                            className="text-sm border border-gray-200 hover:border-black rounded-full px-3 py-1 bg-white transition-colors"
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-black"
                    disabled={isLoading}
                />
                <button
                    onClick={() => handleSend(input)}
                    disabled={isLoading || !input.trim()}
                    className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:opacity-80 transition-opacity"
                >
                    <SendHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
