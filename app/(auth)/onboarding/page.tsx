"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const SUBJECTS = [
  { key: "CS", label: "Computer Science", icon: "code", color: "#adc6ff" },
  { key: "MATH", label: "Mathematics", icon: "calculate", color: "#ddb7ff" },
  { key: "PHYSICS", label: "Physics", icon: "science", color: "#ffb786" },
  { key: "CHEMISTRY", label: "Chemistry", icon: "biotech", color: "#4ade80" },
  { key: "BIO", label: "Biology", icon: "eco", color: "#34d399" },
  { key: "HISTORY", label: "History", icon: "menu_book", color: "#fb923c" },
  { key: "ECON", label: "Economics", icon: "trending_up", color: "#a78bfa" },
  { key: "LIT", label: "Literature", icon: "auto_stories", color: "#f472b6" },
];
const GOALS = [
  { key: "EXAM_PREP", label: "Exam Preparation", icon: "assignment" },
  { key: "CONCEPT_MASTERY", label: "Concept Mastery", icon: "psychology" },
  { key: "RESEARCH", label: "Research & Deep Learning", icon: "search" },
  { key: "REVISION", label: "Quick Revision", icon: "bolt" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [dailyGoal, setDailyGoal] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSubject = (key: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : prev.length < 4 ? [...prev, key] : prev
    );
  };

  const handleFinish = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate save
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-on-primary">auto_awesome</span>
            </div>
            <span className="text-headline-md font-bold text-on-surface">Learn<span className="text-primary">AI</span></span>
          </div>
          <p className="text-headline-md text-on-surface">Welcome{user?.firstName ? `, ${user.firstName}` : ""}! 🎉</p>
          <p className="text-body-lg text-on-surface-variant mt-2">Let&apos;s personalize your learning experience.</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 max-w-[300px] mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-surface-container-low">
              <motion.div animate={{ width: step >= s ? "100%" : "0%" }} transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-headline-md text-on-surface mb-2">What do you study?</h2>
                <p className="text-body-md text-on-surface-variant mb-6">Select up to 4 subjects you want to focus on.</p>
                <div className="grid grid-cols-2 gap-3">
                  {SUBJECTS.map((s) => (
                    <button key={s.key} onClick={() => toggleSubject(s.key)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${selectedSubjects.includes(s.key) ? "border-primary/40 bg-primary/10" : "border-outline-variant/20 hover:border-primary/20 hover:bg-surface-variant/20"}`}>
                      <span className="material-symbols-outlined text-[22px]" style={{ color: selectedSubjects.includes(s.key) ? s.color : "var(--on-surface-variant)" }}>{s.icon}</span>
                      <span className={`text-label-sm font-medium ${selectedSubjects.includes(s.key) ? "text-on-surface" : "text-on-surface-variant"}`}>{s.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-3">{selectedSubjects.length}/4 subjects selected</p>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => setStep(2)} disabled={selectedSubjects.length === 0}
                  className="btn-gradient px-8 py-3 rounded-xl text-on-primary font-bold text-label-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-headline-md text-on-surface mb-2">What&apos;s your primary goal?</h2>
                <p className="text-body-md text-on-surface-variant mb-6">This helps us tailor your AI recommendations.</p>
                <div className="space-y-3">
                  {GOALS.map((g) => (
                    <button key={g.key} onClick={() => setSelectedGoal(g.key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selectedGoal === g.key ? "border-secondary/40 bg-secondary/10" : "border-outline-variant/20 hover:border-secondary/20"}`}>
                      <span className={`material-symbols-outlined text-[22px] ${selectedGoal === g.key ? "text-secondary" : "text-on-surface-variant"}`}>{g.icon}</span>
                      <span className={`text-label-sm font-medium ${selectedGoal === g.key ? "text-on-surface" : "text-on-surface-variant"}`}>{g.label}</span>
                      {selectedGoal === g.key && <span className="material-symbols-outlined text-[18px] text-secondary ml-auto">check_circle</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant text-label-sm hover:bg-surface-variant/30 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                </button>
                <button onClick={() => setStep(3)} disabled={!selectedGoal}
                  className="btn-gradient px-8 py-3 rounded-xl text-on-primary font-bold text-label-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-headline-md text-on-surface mb-2">Set your daily study goal</h2>
                <p className="text-body-md text-on-surface-variant mb-8">Consistent practice is key to mastery.</p>
                <div className="text-center mb-8">
                  <div className="text-[64px] font-bold text-primary leading-none">{dailyGoal}</div>
                  <div className="text-body-lg text-on-surface-variant">minutes per day</div>
                </div>
                <input type="range" min="15" max="180" step="15" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer" />
                <div className="flex justify-between text-label-sm text-on-surface-variant mt-2">
                  <span>15 min</span><span>60 min</span><span>3 hours</span>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-label-sm text-primary font-bold">💡 Recommendation</p>
                  <p className="text-[12px] text-on-surface-variant mt-1">
                    {dailyGoal <= 30 ? "Perfect for beginners — builds a great habit." : dailyGoal <= 60 ? "Ideal for steady progress. You'll see real results in weeks." : "Power learner! Make sure to take breaks every 25 minutes."}
                  </p>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant text-label-sm hover:bg-surface-variant/30 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
                </button>
                <button onClick={handleFinish} disabled={isLoading}
                  className="btn-gradient px-8 py-3 rounded-xl text-on-primary font-bold text-label-sm disabled:opacity-50 flex items-center gap-2">
                  {isLoading ? <><span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>Setting up...</>
                    : <><span className="material-symbols-outlined text-[18px]">rocket_launch</span>Launch LearnAI</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
