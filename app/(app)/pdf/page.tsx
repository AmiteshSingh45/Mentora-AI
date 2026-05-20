"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";
import ReactMarkdown from "react-markdown";

interface UploadedDoc { id: string; name: string; status: string; pageCount: number | null; chunkCount: number; }
interface ChatMessage { role: "user" | "assistant"; content: string; }

export default function PDFPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, []);

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") { setUploadError("Only PDF files are supported."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("File too large. Maximum size is 10MB."); return; }
    setIsUploading(true); setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/pdf/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setUploadedDoc(data);
        setMessages([{ role: "assistant", content: `✅ **${data.name}** has been processed successfully!\n\n📄 **${data.pageCount ?? "?"} pages** | 🧩 **${data.chunkCount} chunks** indexed for semantic search\n\nYou can now ask me anything about this document. I'll provide answers with relevant context.` }]);
      } else { setUploadError(data.error ?? "Upload failed. Please try again."); }
    } catch { setUploadError("Upload failed. Please check your connection."); }
    finally { setIsUploading(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || isChatLoading) return;
    const userMsg = input.trim(); setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, documentId: uploadedDoc?.id, subject: "PDF Analysis" }),
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantMsg = "";
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try { const parsed = JSON.parse(data); assistantMsg += parsed.text ?? ""; }
              catch { assistantMsg += data; }
            }
          }
          setMessages((prev) => { const next = [...prev]; next[next.length - 1] = { role: "assistant", content: assistantMsg }; return next; });
        }
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "I'm unable to process that request right now. Please configure your AI API key." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please check your API configuration." }]);
    } finally { setIsChatLoading(false); chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 h-[calc(100vh-80px)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-headline-lg text-on-surface">PDF Workspace</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">Upload a PDF and chat with it using AI-powered semantic search.</p>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 min-h-0">
        {/* Left: Upload Panel */}
        <div className="space-y-4">
          {!uploadedDoc ? (
            <GlassCard className="h-full flex flex-col">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex flex-col items-center justify-center p-8 m-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${isDragging ? "border-primary/60 bg-primary/10 scale-[1.02]" : "border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5"}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                {isUploading ? (
                  <>
                    <div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-4" />
                    <p className="text-body-lg text-on-surface">Processing PDF...</p>
                    <p className="text-label-sm text-on-surface-variant mt-1">Parsing and indexing your document</p>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragging ? "bg-primary/30" : "bg-primary/10"}`}>
                      <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
                    </div>
                    <p className="text-body-lg text-on-surface font-medium text-center">Drop your PDF here</p>
                    <p className="text-label-sm text-on-surface-variant mt-1 text-center">or click to browse</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-3">PDF only • Max 10MB</p>
                  </>
                )}
              </div>
              {uploadError && (
                <div className="mx-4 mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-label-sm">{uploadError}</div>
              )}
              <div className="p-4 pt-0 space-y-2">
                <p className="text-label-caps text-on-surface-variant">WHAT YOU CAN DO</p>
                {["Ask questions about the document", "Get summaries of key sections", "Find specific information quickly", "Generate quiz questions from content"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>{f}
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label-sm font-bold text-on-surface truncate">{uploadedDoc.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{uploadedDoc.pageCount ?? "?"} pages • {uploadedDoc.chunkCount} chunks indexed</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-full bg-secondary/10 text-secondary">READY</span>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-label-caps text-on-surface-variant mb-2">QUICK QUESTIONS</p>
                {["Summarize the main points", "What are the key conclusions?", "Explain the methodology", "List all important terms"].map((q) => (
                  <button key={q} onClick={() => { setInput(q); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-label-sm text-on-surface-variant border border-outline-variant/20 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all">
                    {q}
                  </button>
                ))}
              </div>
              <button onClick={() => { setUploadedDoc(null); setMessages([]); setInput(""); }}
                className="mt-4 w-full py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant text-label-sm hover:bg-surface-variant/30 transition-all">
                Upload Different PDF
              </button>
            </GlassCard>
          )}
        </div>

        {/* Right: Chat */}
        <GlassCard className="flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[32px]">chat</span>
                </div>
                <p className="text-headline-md text-on-surface">Upload a PDF to start</p>
                <p className="text-body-md text-on-surface-variant">I&apos;ll help you understand any document using AI-powered search.</p>
              </div>
            ) : messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary/20" : "bg-secondary/20"}`}>
                  <span className="material-symbols-outlined text-[16px] text-on-surface">{msg.role === "user" ? "person" : "auto_awesome"}</span>
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-primary/20 text-on-surface rounded-tr-sm" : "bg-surface-container-low text-on-surface rounded-tl-sm"}`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown components={{
                      p: ({children}) => <p className="text-body-md text-on-surface-variant mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      strong: ({children}) => <strong className="text-on-surface font-bold">{children}</strong>,
                      code: ({children}) => <code className="bg-surface-container text-tertiary px-1 py-0.5 rounded text-[12px] font-mono">{children}</code>,
                      li: ({children}) => <li className="text-body-md text-on-surface-variant mb-1">{children}</li>,
                    }}>{msg.content}</ReactMarkdown>
                  ) : (
                    <p className="text-body-md text-on-surface">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {isChatLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-on-surface">auto_awesome</span>
                </div>
                <div className="bg-surface-container-low rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-outline-variant/10">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={uploadedDoc ? "Ask anything about the document..." : "Upload a PDF first to start chatting..."}
                disabled={!uploadedDoc || isChatLoading}
                className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-body-md focus:outline-none focus:border-primary/40 placeholder:text-on-surface-variant/50 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !uploadedDoc || isChatLoading}
                className="w-12 h-12 rounded-xl btn-gradient flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-on-primary text-[20px]">send</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
