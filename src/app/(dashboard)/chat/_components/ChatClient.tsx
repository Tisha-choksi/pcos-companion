"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type ChatClientProps = {
    initialMessages: Message[];
    initialConversationId: string | null;
    userName: string;
    phenotype: string | null | undefined;
};

const SUGGESTED_QUESTIONS = [
    "Why am I always tired before my period?",
    "What's the best breakfast for my PCOS type?",
    "How do I reduce sugar cravings?",
    "Should I be doing HIIT?",
    "What questions should I ask my doctor?",
];

export function ChatClient({
    initialMessages,
    initialConversationId,
    userName,
    phenotype,
}: ChatClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [conversationId, setConversationId] = useState<string | null>(
        initialConversationId,
    );
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = "auto";
            ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
        }
    }, [input]);

    async function sendMessage(text: string) {
        if (!text.trim() || streaming) return;

        setError(null);

        const userMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: text,
        };
        const assistantMsg: Message = {
            id: `temp-asst-${Date.now()}`,
            role: "assistant",
            content: "",
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput("");
        setStreaming(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, conversationId }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to send message");
            }

            if (!res.body) throw new Error("No response stream");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.type === "conv") {
                            setConversationId(data.id);
                        } else if (data.type === "token") {
                            setMessages((prev) =>
                                prev.map((m, i) =>
                                    i === prev.length - 1
                                        ? { ...m, content: m.content + data.content }
                                        : m,
                                ),
                            );
                        } else if (data.type === "error") {
                            throw new Error(data.message);
                        }
                    } catch (e) {
                        // Ignore parse errors mid-stream
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setMessages((prev) => prev.slice(0, -2)); // Remove the failed exchange
        } finally {
            setStreaming(false);
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        sendMessage(input);
    }

    function handleSuggestedClick(q: string) {
        sendMessage(q);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    const showWelcome = messages.length === 0;

    return (
        <div className="flex flex-col h-[calc(100vh-65px)]">
            {/* Header */}
            <div className="border-b border-border/40">
                <div className="mx-auto max-w-3xl px-6 py-4 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="font-semibold">Chat with Lumen</h1>
                        <p className="text-xs text-muted-foreground">
                            Your PCOS companion. Not a doctor.
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl px-6 py-8">
                    {showWelcome ? (
                        <WelcomeView
                            userName={userName}
                            phenotype={phenotype}
                            onSuggestedClick={handleSuggestedClick}
                        />
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                            {streaming &&
                                messages[messages.length - 1]?.role === "assistant" &&
                                !messages[messages.length - 1]?.content && (
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Thinking...
                                    </div>
                                )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-border/40 bg-background">
                <div className="mx-auto max-w-3xl px-6 py-4">
                    <form onSubmit={handleSubmit} className="relative">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about your PCOS, cycle, symptoms..."
                            disabled={streaming}
                            rows={1}
                            className="resize-none pr-12 min-h-[48px]"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute right-2 bottom-2 h-8 w-8"
                            disabled={streaming || !input.trim()}
                        >
                            {streaming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Lumen can be wrong. Always consult your doctor for medical decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}

function WelcomeView({
    userName,
    phenotype,
    onSuggestedClick,
}: {
    userName: string;
    phenotype: string | null | undefined;
    onSuggestedClick: (q: string) => void;
}) {
    return (
        <div className="text-center max-w-xl mx-auto py-12">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
                Hi {userName}
            </h2>
            <p className="text-muted-foreground mb-10">
                I&apos;m Lumen. I know your phenotype, cycles, symptoms, and patterns. Ask me anything about your PCOS.
                {phenotype && (
                    <span className="block text-xs mt-2">
                        (You&apos;re tracked as {phenotype.toLowerCase().replace("_", "-")} type.)
                    </span>
                )}
            </p>

            <div className="text-left">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3 text-center">
                    Try asking
                </p>
                <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                            key={q}
                            onClick={() => onSuggestedClick(q)}
                            className="w-full text-left p-3 border rounded-lg hover:border-primary/40 hover:bg-accent/30 transition text-sm"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <div className={cn("flex gap-3", isUser && "justify-end")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
            )}
            <div
                className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%]",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                )}
            >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content || "..."}
                </div>
            </div>
        </div>
    );
}