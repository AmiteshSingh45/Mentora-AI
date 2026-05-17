import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Lab",
  description: "Practice speaking with AI-powered voice interaction",
};

export default function VoicePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface">Voice Lab</h1>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Practice oral exams and interviews with real-time AI voice interaction.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[60vh]">
        {/* Waveform visualizer */}
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/10 blur-3xl rounded-full" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[56px]">keyboard_voice</span>
            </div>
          </div>

          {/* Waveform bars */}
          <div className="flex items-end gap-1 h-16">
            {[4, 7, 12, 9, 5, 11, 8, 13, 6, 4, 9, 12, 7, 5, 11].map((h, i) => (
              <div
                key={i}
                className="w-2 rounded-full"
                style={{
                  height: `${h * 4}px`,
                  backgroundColor: `rgba(173, 198, 255, ${0.3 + (i % 3) * 0.2})`,
                  boxShadow: i === 7 ? "0 0 8px rgba(173, 198, 255, 0.6)" : undefined,
                }}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <button className="px-8 py-3 btn-gradient text-on-primary font-bold rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined">mic</span>
              Start Recording
            </button>
            <button className="px-6 py-3 glass-card border border-outline-variant/20 text-on-surface-variant hover:text-on-surface rounded-2xl font-bold transition-all">
              Stop
            </button>
          </div>

          <p className="text-label-sm text-outline">Press to speak — LearnAI will respond in real-time</p>
        </div>

        {/* Transcript panel */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-label-caps text-on-surface-variant mb-4">PRACTICE MODES</h3>
            {[
              { icon: "work", title: "Technical Interview", desc: "Practice common DS/Algo interview questions out loud", color: "var(--color-primary)" },
              { icon: "school", title: "Concept Explanation", desc: "Explain topics as if teaching — improve retention", color: "var(--color-secondary)" },
              { icon: "record_voice_over", title: "Oral Exam Prep", desc: "Simulate oral examination with AI feedback", color: "var(--color-tertiary)" },
            ].map((mode) => (
              <div key={mode.title} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-variant/30 transition-all cursor-pointer mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${mode.color}15` }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: mode.color }}>{mode.icon}</span>
                </div>
                <div>
                  <p className="text-label-sm font-bold text-on-surface">{mode.title}</p>
                  <p className="text-[11px] text-on-surface-variant">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-label-caps text-on-surface-variant mb-3">TRANSCRIPT</h3>
            <p className="text-body-md text-on-surface-variant/50 italic">Your transcript will appear here after recording...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
