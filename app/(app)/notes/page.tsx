"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { GlassCard } from "@/components/shared/GlassCard";

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","Computer Science","History","Economics","Literature","Engineering","General"];
const FORMATS = [
  { key: "MARKDOWN", label: "Markdown", icon: "code" },
  { key: "BULLETS", label: "Bullets", icon: "format_list_bulleted" },
  { key: "PDF", label: "PDF Ready", icon: "picture_as_pdf" },
];
const QUICK_TOPICS = ["Binary Search Trees","Photosynthesis","Newton's Laws","SQL Joins","Big-O Notation"];

export default function NotesPage() {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [format, setFormat] = useState("MARKDOWN");
  const [notes, setNotes] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedNotes, setSavedNotes] = useState<{id:string;title:string;subject:string|null;updatedAt:string}[]>([]);
  const [activeTab, setActiveTab] = useState<"generate"|"saved">("generate");
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchSavedNotes(); }, []);

  const fetchSavedNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) { const d = await res.json(); setSavedNotes(d.notes ?? []); }
    } catch { /* non-fatal */ }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true); setNotes(""); setNoteTitle("");
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), subject: subject || undefined, format }),
      });
      const data = await res.json();
      if (res.ok) { setNotes(data.content); setNoteTitle(data.title); setNoteId(data.noteId); fetchSavedNotes(); }
      else setNotes(`**Error:** ${data.error ?? "Failed to generate notes."}`);
    } catch { setNotes("**Error:** Unable to connect to the AI service."); }
    finally { setIsGenerating(false); }
  };

  const handleCopy = async () => {
    if (!notes) return;
    await navigator.clipboard.writeText(notes);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!notes) return;
    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${noteTitle||"notes"}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="mb-8">
        <h1 className="text-headline-lg text-on-surface">Smart Notes</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">Generate AI-powered, exam-ready study notes on any topic.</p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {([{key:"generate",label:"Generate Notes",icon:"auto_awesome"},{key:"saved",label:`Saved (${savedNotes.length})`,icon:"bookmark"}] as const).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-label-sm font-bold transition-all ${activeTab===tab.key?"bg-primary/20 text-primary border border-primary/30":"text-on-surface-variant hover:bg-surface-variant/30"}`}>
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "generate" ? (
          <motion.div key="gen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
            <GlassCard className="p-6 space-y-4 h-fit">
              <h3 className="text-headline-md text-on-surface">Note Settings</h3>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">TOPIC *</label>
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Binary Search Trees, Photosynthesis..."
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface text-body-md resize-none h-24 focus:outline-none focus:border-primary/40 placeholder:text-on-surface-variant/50"
                  onKeyDown={(e) => { if(e.key==="Enter"&&e.ctrlKey) handleGenerate(); }} />
              </div>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">SUBJECT</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface text-body-md focus:outline-none focus:border-primary/40 appearance-none">
                  <option value="">Select subject (optional)</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">FORMAT</label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map((f) => (
                    <button key={f.key} onClick={() => setFormat(f.key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${format===f.key?"border-primary/40 bg-primary/10 text-primary":"border-outline-variant/20 text-on-surface-variant hover:border-primary/20"}`}>
                      <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                      <span className="text-[11px] font-bold">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleGenerate} disabled={!topic.trim()||isGenerating}
                className="w-full btn-gradient py-3.5 rounded-xl text-on-primary font-bold text-label-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isGenerating ? <><span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>Generating...</>
                  : <><span className="material-symbols-outlined text-[18px]">auto_awesome</span>Generate Notes</>}
              </button>
              <p className="text-[11px] text-on-surface-variant text-center">Ctrl+Enter to generate</p>
            </GlassCard>

            <GlassCard className="p-6 min-h-[500px]">
              {notes ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-headline-md text-on-surface">{noteTitle}</h3>
                      {noteId && <span className="text-[11px] text-secondary">✓ Saved to your notes</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface text-label-sm transition-all">
                        <span className="material-symbols-outlined text-[16px]">{copied?"check":"content_copy"}</span>{copied?"Copied!":"Copy"}
                      </button>
                      <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface text-label-sm transition-all">
                        <span className="material-symbols-outlined text-[16px]">download</span>.md
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none overflow-auto" style={{maxHeight:"calc(100vh - 340px)"}}>
                    <ReactMarkdown components={{
                      h1:({children})=><h1 className="text-headline-md text-on-surface mt-4 mb-2">{children}</h1>,
                      h2:({children})=><h2 className="text-headline-sm text-primary mt-4 mb-2">{children}</h2>,
                      h3:({children})=><h3 className="text-body-lg font-bold text-secondary mt-3 mb-2">{children}</h3>,
                      p:({children})=><p className="text-body-md text-on-surface-variant mb-3 leading-relaxed">{children}</p>,
                      li:({children})=><li className="text-body-md text-on-surface-variant mb-1">{children}</li>,
                      strong:({children})=><strong className="text-on-surface font-bold">{children}</strong>,
                      code:({children})=><code className="bg-surface-container-low text-tertiary px-1.5 py-0.5 rounded text-[13px] font-mono">{children}</code>,
                    }}>{notes}</ReactMarkdown>
                  </div>
                </>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="relative"><div className="w-16 h-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="material-symbols-outlined absolute inset-0 m-auto text-primary text-[24px] leading-[64px] text-center">auto_awesome</span></div>
                  <p className="text-body-lg text-on-surface-variant animate-pulse">Generating your notes...</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[32px]">description</span>
                  </div>
                  <div>
                    <p className="text-headline-md text-on-surface">Your notes will appear here</p>
                    <p className="text-body-md text-on-surface-variant mt-1">Enter a topic and click Generate Notes</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_TOPICS.map((t) => (
                      <button key={t} onClick={() => setTopic(t)} className="px-3 py-1.5 rounded-full text-label-sm border border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all">{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="saved" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            {savedNotes.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 block mb-4">bookmark_border</span>
                <p className="text-headline-md text-on-surface">No saved notes yet</p>
                <p className="text-body-md text-on-surface-variant mt-2">Generate notes on any topic to save them here</p>
                <button onClick={() => setActiveTab("generate")} className="mt-6 btn-gradient px-6 py-3 rounded-xl text-on-primary font-bold text-label-sm">Generate First Note</button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedNotes.map((note) => (
                  <GlassCard key={note.id} hover className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                      {note.subject && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{note.subject}</span>}
                    </div>
                    <h3 className="text-label-sm font-bold text-on-surface mb-1 line-clamp-2">{note.title}</h3>
                    <p className="text-[11px] text-on-surface-variant">{new Date(note.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
