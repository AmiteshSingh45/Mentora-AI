"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, GradientBadge, ProgressBar, EmptyState } from "@/components/shared/GlassCard";
import { SUBJECTS, DIFFICULTY_LABELS, type Difficulty } from "@/types";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
}

interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
}

type QuizState = "setup" | "active" | "results";

export function QuizGeneratorClient() {
  const [state, setState] = useState<QuizState>("setup");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const generateQuiz = async () => {
    if (!subject.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, difficulty, numQuestions }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuiz(data.quiz);
        setCurrentQ(0);
        setAnswers({});
        setTimeLeft(numQuestions * 60);
        setState("active");
      } else {
        // Demo mode with mock quiz
        setQuiz(getMockQuiz(subject, numQuestions));
        setCurrentQ(0);
        setAnswers({});
        setState("active");
      }
    } catch {
      setQuiz(getMockQuiz(subject, numQuestions));
      setCurrentQ(0);
      setAnswers({});
      setState("active");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      setState("results");
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    const correct = quiz.questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  // ==========================================
  // Setup Screen
  // ==========================================
  if (state === "setup") {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
        <div className="mb-10">
          <h1 className="text-headline-lg text-on-surface">Quiz Generator</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Generate AI-powered quizzes from any topic, difficulty, and format.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6" animate>
              <h3 className="text-headline-md text-on-surface mb-6">Configure Your Quiz</h3>

              {/* Subject Input */}
              <div className="space-y-2 mb-6">
                <label className="text-label-caps text-on-surface-variant">TOPIC OR SUBJECT</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Binary Trees, SQL Joins, Neural Networks..."
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Quick Subject Selector */}
              <div className="space-y-2 mb-6">
                <label className="text-label-caps text-on-surface-variant">QUICK SELECT</label>
                <div className="flex flex-wrap gap-2">
                  {["DSA", "DBMS", "OS", "CN", "AI/ML", "Web Dev", "System Design"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-label-sm transition-all border",
                        subject === s
                          ? "bg-primary/20 border-primary text-primary"
                          : "glass-card border-outline-variant/20 text-on-surface-variant hover:border-primary/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2 mb-6">
                <label className="text-label-caps text-on-surface-variant">DIFFICULTY</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "p-3 rounded-xl border text-center transition-all",
                        difficulty === d
                          ? "bg-secondary-container/10 border-secondary text-secondary"
                          : "glass-card border-outline-variant/10 text-on-surface-variant hover:border-outline"
                      )}
                    >
                      <p className="text-label-sm font-bold">{DIFFICULTY_LABELS[d]}</p>
                      <div className="flex gap-1 justify-center mt-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-4 h-1 rounded-full",
                              i < (d === "EASY" ? 1 : d === "MEDIUM" ? 2 : 3)
                                ? "bg-secondary"
                                : "bg-outline-variant/30"
                            )}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-label-caps text-on-surface-variant">NUMBER OF QUESTIONS</label>
                  <span className="text-label-sm text-primary font-bold">{numQuestions}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={5}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-outline font-mono">
                  <span>5</span><span>10</span><span>15</span><span>20</span><span>25</span>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateQuiz}
                disabled={!subject.trim() || isGenerating}
                className={cn(
                  "mt-8 w-full py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-3 transition-all",
                  subject.trim() && !isGenerating
                    ? "btn-gradient text-on-primary"
                    : "bg-surface-container text-outline cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate {numQuestions}-Question Quiz
                  </>
                )}
              </motion.button>
            </GlassCard>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <GlassCard className="p-6" animate delay={0.1}>
              <h3 className="text-label-caps text-on-surface-variant mb-4">QUIZ FEATURES</h3>
              {[
                { icon: "quiz", label: "MCQ format with 4 options", color: "var(--color-primary)" },
                { icon: "schedule", label: "Timed session with countdown", color: "var(--color-secondary)" },
                { icon: "auto_awesome", label: "AI explanations for each answer", color: "var(--color-tertiary)" },
                { icon: "trending_up", label: "Score tracking & XP rewards", color: "#4ade80" },
                { icon: "bookmark", label: "Save quiz to your history", color: "#fb923c" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 py-2.5 border-b border-outline-variant/10 last:border-0">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: f.color }}>{f.icon}</span>
                  <span className="text-label-sm text-on-surface-variant">{f.label}</span>
                </div>
              ))}
            </GlassCard>

            <GlassCard className="p-6" animate delay={0.2}>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                <h3 className="text-label-caps text-on-surface-variant">AI POWERED</h3>
              </div>
              <p className="text-body-md text-on-surface-variant">
                Questions are generated by Gemini 2.0 Flash and tailored to your exact topic and difficulty level.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Active Quiz Screen
  // ==========================================
  if (state === "active" && quiz) {
    const question = quiz.questions[currentQ];
    const progress = ((currentQ + 1) / quiz.questions.length) * 100;
    const answered = answers[question.id];

    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Question Card */}
          <div className="col-span-12 lg:col-span-8">
            <GlassCard className="p-6" animate={false}>
              {/* Progress + Timer Row */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex-1 mr-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-label-caps text-on-surface-variant">
                      QUESTION {currentQ + 1} OF {quiz.questions.length}
                    </span>
                    <span className="text-label-sm text-primary">{Math.round(progress)}% Complete</span>
                  </div>
                  <ProgressBar value={progress} color="var(--color-primary)" />
                </div>
                <div className="glass-card flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                  <span className="text-headline-md text-primary font-bold font-mono">{String(Math.floor(timeLeft/60)).padStart(2,"0")}:{String(timeLeft%60).padStart(2,"0")}</span>
                </div>
              </div>

              {/* Question */}
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-headline-md text-on-surface leading-snug mb-8">
                  {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === question.correctAnswer;
                    const showResult = showExplanation;

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!showExplanation ? { x: 4 } : {}}
                        whileTap={!showExplanation ? { scale: 0.99 } : {}}
                        onClick={() => !showExplanation && handleAnswer(question.id, idx)}
                        disabled={showExplanation}
                        className={cn(
                          "w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-200 text-left",
                          showResult && isCorrect
                            ? "border-green-500/60 bg-green-500/10"
                            : showResult && isSelected && !isCorrect
                            ? "border-red-500/60 bg-red-500/10"
                            : isSelected
                            ? "border-secondary bg-secondary-container/10"
                            : "border-outline-variant/10 bg-surface-container-low hover:border-primary/40 hover:bg-surface-variant/30"
                        )}
                      >
                        <span className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl border text-label-caps font-bold flex-shrink-0",
                          showResult && isCorrect
                            ? "bg-green-500 text-white border-green-500"
                            : showResult && isSelected && !isCorrect
                            ? "bg-red-500 text-white border-red-500"
                            : isSelected
                            ? "bg-secondary text-on-secondary border-secondary"
                            : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-body-lg text-on-surface flex-1">{option}</span>
                        {showResult && isCorrect && (
                          <span className="material-symbols-outlined text-green-400"
                            style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="material-symbols-outlined text-red-400"
                            style={{ fontVariationSettings: "'FILL' 1" }}>
                            cancel
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-4 rounded-xl bg-secondary/5 border border-secondary/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-secondary text-[18px]">auto_awesome</span>
                        <span className="text-label-caps text-secondary">AI EXPLANATION</span>
                      </div>
                      <p className="text-body-md text-on-surface">{question.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-outline-variant/10">
                  <button
                    onClick={() => { setCurrentQ(Math.max(0, currentQ - 1)); setSelectedAnswer(null); setShowExplanation(false); }}
                    disabled={currentQ === 0}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Previous
                  </button>

                  <div className="flex gap-3">
                    <button className="px-5 py-3 rounded-xl text-on-surface-variant border border-outline-variant/20 hover:bg-surface-variant/30 transition-colors text-label-sm">
                      Flag Question
                    </button>
                    {showExplanation && (
                      <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={nextQuestion}
                        className="flex items-center gap-2 px-8 py-3 btn-gradient text-on-primary font-bold rounded-xl"
                      >
                        {currentQ < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </GlassCard>
          </div>

          {/* Sidebar Stats */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <GlassCard className="p-5" animate={false}>
              <h3 className="text-label-caps text-on-surface-variant mb-4">LIVE SESSION</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-low text-center">
                  <p className="text-[28px] font-bold text-on-surface">
                    {Object.values(answers).filter((a, i) => a === quiz.questions[i]?.correctAnswer).length}/{quiz.questions.length}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">Correct</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low text-center">
                  <p className="text-[28px] font-bold text-on-surface">{currentQ + 1}</p>
                  <p className="text-label-sm text-on-surface-variant">Current</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5" animate={false}>
              <h3 className="text-label-caps text-on-surface-variant mb-3">DIFFICULTY</h3>
              <GradientBadge variant="secondary">{DIFFICULTY_LABELS[difficulty]}</GradientBadge>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Results Screen
  // ==========================================
  if (state === "results" && quiz) {
    const score = calculateScore();
    const correct = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const scoreColor = score >= 80 ? "#4ade80" : score >= 60 ? "#adc6ff" : "#f87171";

    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <GlassCard className="p-8" animate={false}>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: `radial-gradient(circle, ${scoreColor}20, transparent)`, border: `2px solid ${scoreColor}` }}
            >
              <span className="text-[36px] font-bold" style={{ color: scoreColor }}>{score}%</span>
            </div>

            <h2 className="text-headline-lg text-on-surface mb-2">
              {score >= 80 ? "🎉 Excellent!" : score >= 60 ? "👍 Good Job!" : "📚 Keep Practicing!"}
            </h2>
            <p className="text-body-lg text-on-surface-variant mb-8">
              You answered {correct} out of {quiz.questions.length} questions correctly.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-[24px] font-bold text-on-surface">{correct}</p>
                <p className="text-label-sm text-on-surface-variant">Correct</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-[24px] font-bold text-error">{quiz.questions.length - correct}</p>
                <p className="text-label-sm text-on-surface-variant">Wrong</p>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-[24px] font-bold text-tertiary">+{Math.round(score * 2.5)} XP</p>
                <p className="text-label-sm text-on-surface-variant">Earned</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => { setState("setup"); setQuiz(null); setSubject(""); }}
                className="px-8 py-3 btn-gradient text-on-primary font-bold rounded-xl"
              >
                New Quiz
              </motion.button>
              <button
                onClick={() => { setCurrentQ(0); setAnswers({}); setSelectedAnswer(null); setShowExplanation(false); setState("active"); }}
                className="px-8 py-3 glass-card border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-variant/30 transition-all"
              >
                Retry Quiz
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return null;
}

function getMockQuiz(subject: string, count: number): GeneratedQuiz {
  const questions: QuizQuestion[] = Array.from({ length: count }, (_, i) => ({
    id: `q${i}`,
    question: `Sample question ${i + 1} about ${subject}: Which of the following best describes the concept?`,
    options: ["Option A — First choice", "Option B — Second choice (Correct)", "Option C — Third choice", "Option D — Fourth choice"],
    correctAnswer: 1,
    explanation: `The correct answer is B because it accurately describes the core concept of ${subject}. Option A is incorrect because it confuses the definition. Options C and D are distractors.`,
    difficulty: "MEDIUM",
  }));
  return { title: `${subject} Quiz`, questions };
}
