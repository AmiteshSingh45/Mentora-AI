"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { GlassCard, TypingIndicator } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const SUBJECTS = [
  { label: "Computer Science", icon: "terminal" },
  { label: "DSA", icon: "account_tree" },
  { label: "AI / ML", icon: "smart_toy" },
  { label: "Mathematics", icon: "calculate" },
  { label: "DBMS", icon: "storage" },
  { label: "Interview Prep", icon: "work" },
];

const SUGGESTED_PROMPTS = [
  "Explain Big O notation with a real example",
  "What is the difference between SQL and NoSQL?",
  "Explain Transformer architecture in AI",
  "Write a binary search implementation in Python",
  "Explain memory management in OS",
  "What is CAP theorem in distributed systems?",
];

interface Message extends Omit<ChatMessage, "sessionId" | "metadata"> {
  isStreaming?: boolean;
}

interface AIChatInterfaceProps {
  sessionId?: string;
  initialMessages?: Message[];
}

export function AIChatInterface({ sessionId, initialMessages = [] }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [currentStreamText, setCurrentStreamText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamText, scrollToBottom]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText ?? input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "USER",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentStreamText("");

    // Cancel any ongoing stream
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          subject: selectedSubject,
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to get response");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setCurrentStreamText(fullText);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Move streamed text to messages
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ASSISTANT",
        content: fullText || "I apologize, I couldn't generate a response. Please try again.",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentStreamText("");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ASSISTANT",
          content: "I'm having trouble connecting right now. Please check your API key configuration in `.env.local` or try again in a moment.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] relative">
      {/* ==========================================
          Ambient Orbs
         ========================================== */}
      <div className="fixed top-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[10%] left-[25%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* ==========================================
          Chat Messages Area
         ========================================== */}
      <section className="flex-1 overflow-y-auto scrollbar-hide pt-6 pb-48 px-4">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Subject Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {SUBJECTS.map((s) => (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSubject(selectedSubject === s.label ? null : s.label)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-label-sm transition-all",
                  selectedSubject === s.label
                    ? "bg-primary/20 border border-primary text-primary"
                    : "glass-card border border-outline-variant/20 text-on-surface-variant hover:border-primary/40 hover:text-primary"
                )}
              >
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                {s.label}
              </motion.button>
            ))}
          </div>

          {/* Empty state / welcome */}
          {messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 py-12"
            >
              <div className="inline-flex p-5 rounded-2xl glass-card border border-secondary/20 neon-glow-secondary">
                <span
                  className="material-symbols-outlined text-secondary text-[44px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div>
                <h3 className="text-headline-lg text-on-surface mb-2">What are we learning today?</h3>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                  Ask me to explain a concept, write code, solve a problem, or analyze a complex topic.
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(prompt)}
                    className="glass-card p-3.5 rounded-xl text-left text-label-sm text-on-surface-variant hover:border-primary/40 hover:text-on-surface border border-outline-variant/10 transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("flex gap-4", message.role === "USER" ? "justify-end" : "justify-start")}
              >
                {/* AI Avatar */}
                {message.role === "ASSISTANT" && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center mt-1 shadow-lg">
                    <span className="material-symbols-outlined text-[18px] text-on-primary-container">smart_toy</span>
                  </div>
                )}

                <div className={cn("flex flex-col gap-2", message.role === "USER" ? "items-end max-w-[80%]" : "flex-1")}>
                  {/* Message Bubble */}
                  {message.role === "USER" ? (
                    <div className="p-4 rounded-2xl rounded-tr-none bg-primary-container text-on-primary-container shadow-lg">
                      <p className="text-body-md">{message.content}</p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl rounded-tl-none glass-card border border-outline-variant/20 shadow-xl">
                    <div className="prose prose-invert prose-sm max-w-none text-on-surface">
                      <ReactMarkdown
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const isBlock = !node || (node as { position?: unknown }).position !== undefined;
                            
                            return match ? (
                              <div className="rounded-xl overflow-hidden border border-outline-variant/20 my-4">
                                <div className="flex justify-between items-center px-4 py-2 bg-surface-container-highest border-b border-outline-variant/20">
                                  <span className="text-label-caps text-secondary">{match[1]}</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(String(children))}
                                    className="text-label-sm text-outline hover:text-primary transition-colors"
                                  >
                                    Copy Code
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{
                                    margin: 0,
                                    background: "transparent",
                                    fontSize: "13px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                  }}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code
                                className="font-mono text-[13px] bg-surface-container-highest px-1.5 py-0.5 rounded text-secondary"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => <p className="mb-3 last:mb-0 text-on-surface leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-on-surface-variant">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-on-surface-variant">{children}</ol>,
                          h1: ({ children }) => <h1 className="text-headline-md text-on-surface font-bold mb-3">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-[20px] font-bold text-on-surface mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-[16px] font-semibold text-on-surface mb-2">{children}</h3>,
                          strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-primary/50 pl-4 text-on-surface-variant italic my-3">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Message Actions (AI only) */}
                  {message.role === "ASSISTANT" && (
                    <div className="flex gap-3 pl-2">
                      {[
                        { icon: "thumb_up", label: "Helpful" },
                        { icon: "refresh", label: "Regenerate" },
                        { icon: "content_copy", label: "Copy" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={() => action.label === "Copy" && navigator.clipboard.writeText(message.content)}
                          className="flex items-center gap-1 text-label-sm text-outline hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming response */}
          {isLoading && currentStreamText && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined text-[18px] text-on-primary-container">smart_toy</span>
              </div>
              <div className="flex-1 p-5 rounded-2xl rounded-tl-none glass-card border border-outline-variant/20">
                <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{currentStreamText}
                  <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                </p>
              </div>
            </motion.div>
          )}

          {/* Typing indicator (before stream starts) */}
          {isLoading && !currentStreamText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined text-[18px] text-on-primary-container">smart_toy</span>
              </div>
              <TypingIndicator />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* ==========================================
          Input Area (Sticky Bottom)
         ========================================== */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-3xl mx-auto">
          {/* Quick action buttons */}
          <div className="flex gap-2 mb-3">
            {[
              { icon: "keyboard_voice", label: "Voice Lab", href: "/voice" },
              { icon: "upload_file", label: "Upload PDF", href: "/pdf" },
              { icon: "quiz", label: "Generate Quiz", href: "/quiz" },
            ].map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card border border-outline-variant/20 hover:border-primary/50 text-label-sm text-on-surface-variant transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Main Input */}
          <div className="glass-modal rounded-2xl p-2 border border-outline-variant/20 flex items-end gap-3 shadow-2xl focus-within:border-primary/50 transition-all">
            <button className="p-2 text-outline hover:text-primary transition-colors rounded-lg flex-shrink-0">
              <span className="material-symbols-outlined">attach_file</span>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message LearnAI..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none focus:outline-none text-on-surface placeholder:text-outline text-body-md py-2 resize-none"
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                input.trim() && !isLoading
                  ? "bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(173,198,255,0.4)]"
                  : "bg-surface-container text-outline cursor-not-allowed"
              )}
            >
              <span className="material-symbols-outlined font-bold">arrow_upward</span>
            </motion.button>
          </div>

          <p className="text-center text-[10px] text-outline mt-3">
            LearnAI may make mistakes. Verify important information independently.
          </p>
        </div>
      </div>
    </div>
  );
}
