"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    actions?: string[];
}

function CoachChat() {
    const searchParams = useSearchParams();
    const initialMessageParam = searchParams.get("initial_message");
    const actionsParam = searchParams.get("actions");

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize messages
    useEffect(() => {
        if (messages.length === 0) {
            if (initialMessageParam) {
                let actions = [];
                try {
                    if (actionsParam) actions = JSON.parse(actionsParam);
                } catch (e) {
                    console.error("Failed to parse actions", e);
                }
                setMessages([
                    {
                        role: "assistant",
                        content: initialMessageParam,
                        actions: actions.length > 0 ? actions : undefined
                    }
                ]);
            } else {
                setMessages([
                    { role: "assistant", content: "Hello! I'm your AI Performance Coach. I have access to your daily metrics. How are you feeling today?" }
                ]);
            }
        }
    }, [initialMessageParam, actionsParam, messages.length]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsTyping(true);

        try {
            const response = await fetch("/api/coach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userMsg })
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.message,
                actions: data.actionItems
            }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to the neural network. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-xl shadow-neutral-100/50">
                <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-lg">AI Performance Coach</h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                Synchronized • {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-4", msg.role === "assistant" ? "justify-start" : "justify-end")}>
                            {msg.role === "assistant" && (
                                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 mt-1 shrink-0">
                                    <Bot size={18} />
                                </div>
                            )}

                            <div className={cn(
                                "rounded-2xl p-5 max-w-[80%] text-sm leading-relaxed shadow-sm transition-all",
                                msg.role === "assistant"
                                    ? "bg-neutral-50 text-foreground border border-neutral-100 rounded-tl-none"
                                    : "bg-primary text-white font-bold rounded-tr-none shadow-blue-100"
                            )}>
                                <p className={cn(msg.role === "user" ? "text-white" : "text-neutral-700 font-medium")}>{msg.content}</p>
                                {msg.actions && (
                                    <div className="mt-4 pt-4 border-t border-neutral-200/50 space-y-2.5">
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-black mb-3">Priority Actions</p>
                                        {msg.actions.map((action, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-primary text-xs bg-white p-3 rounded-xl border border-neutral-100 shadow-sm font-bold">
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Sparkles size={10} />
                                                </div>
                                                {action}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {
                                msg.role === "user" && (
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary mt-1 shrink-0">
                                        <User size={18} />
                                    </div>
                                )
                            }
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 mt-1">
                                <Bot size={18} />
                            </div>
                            <div className="bg-neutral-50 rounded-2xl p-4 flex items-center gap-2 border border-neutral-100">
                                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className="p-6 bg-neutral-50/50 border-t border-neutral-100">
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask about your performance or recovery..."
                            className="w-full bg-white border border-neutral-200 rounded-2xl pl-5 pr-14 py-5 text-foreground font-medium placeholder:text-neutral-400 shadow-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-neutral-400 mt-4 font-bold uppercase tracking-widest">
                        Neural Core • Performance Analytics Engine v2.0
                    </p>
                </div>
            </div >
        </>
    );
}

export default function CoachPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white rounded-3xl border border-neutral-100 shadow-xl">
                <Bot size={48} className="text-primary animate-pulse" />
            </div>
        }>
            <CoachChat />
        </Suspense>
    );
}
