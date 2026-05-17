import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Workspace",
  description: "Upload PDFs and chat with your documents using AI",
};

export default function PDFPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface">PDF Workspace</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Upload documents and chat with them using AI-powered RAG technology.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-12 text-center border border-dashed border-outline-variant/40 hover:border-primary/40 transition-all cursor-pointer group">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-all">
          <span className="material-symbols-outlined text-primary text-[40px]">upload_file</span>
        </div>
        <h3 className="text-headline-md text-on-surface mb-2">Upload a PDF</h3>
        <p className="text-body-md text-on-surface-variant mb-6 max-w-sm mx-auto">
          Drop your PDF here or click to browse. We&apos;ll extract the text, generate embeddings, and enable AI-powered Q&amp;A.
        </p>
        <button className="btn-gradient px-8 py-3 rounded-xl text-on-primary font-bold text-label-sm">
          Choose PDF File
        </button>
        <p className="text-label-sm text-outline mt-4">Supports PDFs up to 50MB • Multiple files supported</p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "psychology", title: "Semantic Search", desc: "Ask questions in natural language — our RAG pipeline finds the exact relevant sections." },
          { icon: "summarize", title: "Auto Summary", desc: "Get an executive summary of any document in seconds using Gemini AI." },
          { icon: "quiz", title: "Quiz from PDF", desc: "Automatically generate quizzes from your document content for active recall." },
        ].map((f) => (
          <div key={f.title} className="glass-card rounded-2xl p-5">
            <span className="material-symbols-outlined text-primary text-[28px] mb-3 block">{f.icon}</span>
            <h3 className="text-label-sm font-bold text-on-surface mb-1">{f.title}</h3>
            <p className="text-[13px] text-on-surface-variant">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
