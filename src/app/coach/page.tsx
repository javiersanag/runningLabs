"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    actions?: string[];
}

export default function CoachPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your AI Performance Coach. I have access to your daily metrics. How are you feeling today?" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
            <div className="h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden border border-white/10">
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">AI Performance Coach</h3>
                        <p className="text-xs text-white/50 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Online • Access to Real-time Metrics
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-4", msg.role === "assistant" ? "justify-start" : "justify-end")}>
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1 shrink-0">
                                    <Bot size={16} />
                                </div>
                            )}

                            <div className={cn(
                                "rounded-2xl p-4 max-w-[80%] text-sm leading-relaxed",
                                msg.role === "assistant"
                                    ? "bg-white/5 text-white border border-white/10"
                                    : "bg-primary text-black font-medium"
                            )}>
                                <p>{msg.content}</p>
                                {msg.actions && (
                                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                        <p className="text-xs opacity-50 uppercase tracking-widest font-bold mb-2">Recommended Actions</p>
                                        {msg.actions.map((action, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-primary text-xs bg-primary/5 p-2 rounded border border-primary/20">
                                                <Sparkles size={12} />
                                                {action}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mt-1 shrink-0">
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-1">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask about your fitness, recovery, or training plan..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 top-2 p-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-white/20 mt-3">
                        AI Coach predictions are based on estimated physiological models. Consult a professional for medical advice.
                    </p>
                </div>
            </div>
        </>
    );
}
