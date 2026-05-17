import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Notes",
  description: "Generate AI-powered notes from any topic or document",
};

export default function NotesPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface">Smart Notes</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Generate comprehensive, exam-ready notes from any topic or document.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="space-y-4 mb-6">
            <label className="text-label-caps text-on-surface-variant">TOPIC OR PASTE CONTENT</label>
            <textarea
              rows={5}
              placeholder="Enter a topic like 'Binary Search Trees' or paste your text content here..."
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {["Short Notes", "Detailed Notes", "Bullet Summary", "Exam Focus"].map((type) => (
              <button key={type} className="p-3 rounded-xl glass-card border border-outline-variant/10 hover:border-primary/40 text-label-sm text-on-surface-variant hover:text-primary transition-all text-center">
                {type}
              </button>
            ))}
          </div>

          <button className="btn-gradient px-8 py-3 rounded-xl text-on-primary font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Generate Notes
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-label-caps text-on-surface-variant mb-4">EXPORT OPTIONS</h3>
            {[
              { icon: "download", label: "Download as PDF" },
              { icon: "code", label: "Export as Markdown" },
              { icon: "content_copy", label: "Copy to Clipboard" },
            ].map((opt) => (
              <button key={opt.label} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant/30 text-on-surface-variant hover:text-primary transition-all text-label-sm mb-1">
                <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
