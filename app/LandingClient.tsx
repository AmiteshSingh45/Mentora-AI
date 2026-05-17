"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { GlassCard, LightLeak, GradientBadge } from "@/components/shared/GlassCard";

const FEATURES = [
  {
    icon: "chat_spark",
    title: "AI Tutor Co-pilot",
    description:
      "A persistent, context-aware AI tutor that understands your syllabus and breaks down complex concepts in real-time with code, diagrams, and analogies.",
    color: "var(--color-primary)",
    span: "lg:col-span-2",
  },
  {
    icon: "quiz",
    title: "Smart Quizzing",
    description:
      "Automatically generate spaced-repetition quizzes from your PDFs and lecture notes with AI explanations.",
    color: "var(--color-secondary)",
    span: "lg:col-span-1",
  },
  {
    icon: "keyboard_voice",
    title: "Voice Lab",
    description:
      "Practice interviews or oral exams with voice-activated AI feedback on your tone, clarity, and content.",
    color: "var(--color-tertiary)",
    span: "lg:col-span-1",
  },
  {
    icon: "analytics",
    title: "Predictive Analytics",
    description:
      "See your progress mapped against your goals. Pinpoint exactly where your knowledge gaps are with AI-powered insights.",
    color: "var(--color-primary)",
    span: "lg:col-span-2",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "LearnAI transformed my study habits for medical school. The PDF workspace summarizes 50-page research papers into actionable quiz sets in seconds.",
    name: "James D.",
    role: "MED STUDENT @ HARVARD",
    initials: "JD",
    color: "var(--color-primary)",
  },
  {
    quote:
      "The Voice Lab feature is a game changer for interview prep. I felt so much more confident going into my technical rounds at Big Tech companies.",
    name: "Sarah L.",
    role: "SWE INTERN @ GOOGLE",
    initials: "SL",
    color: "var(--color-secondary)",
  },
  {
    quote:
      "It's like having a world-class tutor sitting next to you 24/7. The UI is incredibly smooth and the AI insights are eerily accurate.",
    name: "Marcus K.",
    role: "ECON STUDENT @ MIT",
    initials: "MK",
    color: "var(--color-tertiary)",
  },
];

const STATS = [
  { value: "50K+", label: "Active Learners" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "10x", label: "Faster Learning" },
  { value: "4.9★", label: "App Rating" },
];

export function LandingClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      {/* ==========================================
          Navigation
         ========================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 h-16 glass-panel border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span
              className="material-symbols-outlined text-on-primary-container text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <span className="text-headline-md font-bold gradient-text">LearnAI</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">
            Reviews
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="text-label-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-2 hidden md:block">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(173,198,255,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="bg-primary text-on-primary text-label-sm font-bold px-5 py-2.5 rounded-xl"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </header>

      {/* ==========================================
          Hero Section
         ========================================== */}
      <section ref={heroRef} className="relative pt-32 pb-20 flex flex-col items-center text-center px-6">
        {/* Ambient orbs */}
        <LightLeak color="blue" size="xl" className="-top-32 left-1/2 -translate-x-1/2 opacity-60" />
        <LightLeak color="purple" size="lg" className="top-20 right-0 opacity-30" />
        <LightLeak color="blue" size="md" className="top-40 left-0 opacity-20" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GradientBadge variant="tertiary" className="mb-8 cursor-default">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              v2.0 IS NOW LIVE — Gemini 2.0 Flash Powered
            </GradientBadge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-display-lg gradient-text-hero max-w-[900px] mx-auto mb-6"
          >
            Learn Smarter with Your Personal AI Tutor
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-body-lg text-on-surface-variant max-w-[640px] mx-auto mb-10"
          >
            Master any subject with high-precision AI tutoring, instant quiz generation, and
            realistic interview simulations. Your sophisticated co-pilot for the future of education.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 rounded-2xl font-bold text-[16px] text-on-primary"
                style={{ background: "linear-gradient(135deg, #adc6ff 0%, #ddb7ff 100%)" }}
              >
                Get Started Free
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.01 }}
              className="glass-card px-8 py-4 rounded-2xl font-bold text-[16px] text-on-surface flex items-center gap-2 hover:bg-surface-variant/30 transition-all"
            >
              <span className="material-symbols-outlined">play_circle</span>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="relative max-w-[1100px] mx-auto"
          >
            {/* Glow ring behind preview */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-tertiary/20 blur-3xl opacity-40" />

            <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
              {/* Browser chrome */}
              <div className="h-9 bg-surface-container-high/50 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-error/40" />
                <div className="w-3 h-3 rounded-full bg-tertiary/40" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <div className="ml-4 flex-1 bg-surface-container rounded-full h-5 max-w-[200px] text-[10px] text-outline flex items-center px-3">
                  learnai.app/dashboard
                </div>
              </div>

              {/* Dashboard preview — Mini version */}
              <div className="bg-surface-container-lowest p-4 flex gap-4 min-h-[400px]">
                {/* Mini sidebar */}
                <div className="w-40 glass-panel rounded-xl p-3 flex-shrink-0 hidden sm:block">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-secondary" />
                    <span className="text-[11px] font-bold gradient-text">LearnAI</span>
                  </div>
                  {["Dashboard", "AI Tutor", "PDF Workspace", "Quiz Gen", "Analytics"].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 text-[9px] ${i === 0 ? "bg-secondary-container/10 text-primary font-bold" : "text-on-surface-variant/60"}`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {["dashboard", "chat_spark", "description", "quiz", "analytics"][i]}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>

                {/* Mini dashboard content */}
                <div className="flex-1 space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Streak", value: "14 Days", color: "#fb923c" },
                      { label: "XP", value: "3,420", color: "#adc6ff" },
                      { label: "Quizzes", value: "47", color: "#ddb7ff" },
                      { label: "PDFs", value: "8", color: "#4ade80" },
                    ].map((stat) => (
                      <div key={stat.label} className="glass-card rounded-lg p-2 text-center">
                        <p className="text-[14px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[8px] text-on-surface-variant">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart preview */}
                  <div className="glass-card rounded-lg p-3">
                    <p className="text-[9px] font-bold text-on-surface mb-2">Study Statistics</p>
                    <div className="flex items-end gap-1 h-16">
                      {[35, 65, 90, 45, 55, 20, 10].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${(h / 90) * 100}%`,
                            background: i === 2
                              ? "linear-gradient(to top, #4d8eff, #6f00be)"
                              : "rgba(173,198,255,0.15)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <span key={i} className="text-[7px] text-outline flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendation preview */}
                  <div className="glass-card rounded-lg p-3 border border-primary/15">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-secondary text-[12px]">auto_awesome</span>
                      <span className="text-[8px] font-mono text-secondary">AI SUGGESTION</span>
                    </div>
                    <p className="text-[10px] font-bold text-on-surface">Deep Work: Quantum Mechanics</p>
                    <p className="text-[8px] text-on-surface-variant mt-0.5">45 min session • +250 XP • Advanced</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ==========================================
          Stats Bar
         ========================================== */}
      <section className="py-16 border-y border-outline-variant/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-[40px] font-bold gradient-text">{stat.value}</p>
                <p className="text-label-sm text-on-surface-variant mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          Features Bento Grid
         ========================================== */}
      <section id="features" className="py-24 max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-headline-lg text-on-surface mb-4"
          >
            Precision-engineered learning.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-body-lg text-on-surface-variant"
          >
            Everything you need to master your field in record time.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={feature.span}
            >
              <GlassCard
                className="p-6 h-full flex flex-col gap-5"
                hover
                animate={false}
              >
                <div>
                  <span
                    className="material-symbols-outlined text-[36px] mb-4 block"
                    style={{ color: feature.color }}
                  >
                    {feature.icon}
                  </span>
                  <h3 className="text-headline-md text-on-surface mb-2">{feature.title}</h3>
                  <p className="text-body-md text-on-surface-variant max-w-[400px]">
                    {feature.description}
                  </p>
                </div>

                {/* Feature visual accent */}
                {feature.icon === "quiz" && (
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-1.5 flex-1 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div
                          className="h-full w-3/4 rounded-full"
                          style={{ background: feature.color, boxShadow: `0 0 8px ${feature.color}` }}
                        />
                      </div>
                      <span className="text-label-sm" style={{ color: feature.color }}>75%</span>
                    </div>
                    <p className="text-label-sm text-outline">Mastery of Molecular Biology</p>
                  </div>
                )}

                {feature.icon === "keyboard_voice" && (
                  <div className="flex items-end gap-1 h-12 mt-auto">
                    {[4, 8, 12, 10, 6].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-full"
                        style={{
                          height: `${h * 4}px`,
                          background: feature.color,
                          opacity: [0.4, 0.6, 1, 0.8, 0.5][i],
                          boxShadow: i === 2 ? `0 0 8px ${feature.color}` : undefined,
                        }}
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================
          Subjects Supported
         ========================================== */}
      <section className="py-20 px-6 md:px-12 bg-surface-container-lowest/40 border-y border-outline-variant/10">
        <div className="max-w-[1280px] mx-auto text-center">
          <p className="text-label-caps text-outline mb-8">MASTER EVERY SUBJECT</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Data Structures & Algorithms",
              "DBMS",
              "Operating Systems",
              "Computer Networks",
              "AI / Machine Learning",
              "System Design",
              "Web Development",
              "Aptitude & Reasoning",
              "Mathematics",
              "Physics",
              "Interview Prep",
              "Coding Challenges",
            ].map((subject, i) => (
              <motion.span
                key={subject}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="px-4 py-2 rounded-full glass-card text-label-sm text-on-surface-variant border border-outline-variant/20 hover:border-primary/40 hover:text-primary transition-all cursor-default"
              >
                {subject}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          Testimonials
         ========================================== */}
      <section id="testimonials" className="py-24 max-w-[1280px] mx-auto px-6 md:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-headline-lg text-on-surface text-center mb-16"
        >
          Loved by the next generation of leaders.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <GlassCard className="p-6 flex flex-col gap-4 h-full" hover animate={false}>
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px] text-tertiary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-body-md text-on-surface flex-grow">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-on-primary text-label-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface font-bold">{t.name}</p>
                    <p className="text-[10px] font-mono text-outline">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==========================================
          Final CTA
         ========================================== */}
      <section className="py-32 relative overflow-hidden px-6">
        <LightLeak color="purple" size="xl" className="bottom-0 right-0 opacity-30" />
        <LightLeak color="blue" size="lg" className="top-0 left-0 opacity-20" />

        <div className="max-w-[1280px] mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-display-lg gradient-text-hero mb-8"
          >
            Ready to accelerate your learning?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-body-lg text-on-surface-variant mb-12 max-w-[600px] mx-auto"
          >
            Join 50,000+ students and professionals who are using LearnAI to dominate their fields.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(173,198,255,0.25)" }}
                whileTap={{ scale: 0.97 }}
                className="px-14 py-5 rounded-2xl font-bold text-[18px] text-on-primary"
                style={{ background: "linear-gradient(135deg, #adc6ff 0%, #ddb7ff 100%)" }}
              >
                Get Started For Free
              </motion.button>
            </Link>
            <Link href="/pricing">
              <button className="text-label-sm text-on-surface-variant hover:text-primary transition-colors px-4 py-2">
                View Pricing →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          Footer
         ========================================== */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary-container text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <span className="text-headline-md font-bold gradient-text">LearnAI</span>
          </div>
          <div className="flex gap-8">
            {["Privacy", "Terms", "API", "Contact", "Blog", "Careers"].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-label-sm text-on-surface-variant hover:text-secondary transition-colors underline-offset-4 hover:underline"
              >
                {link}
              </Link>
            ))}
          </div>
          <p className="text-label-sm text-on-surface-variant opacity-50 mt-2">
            © 2025 LearnAI. Future of Education.
          </p>
        </div>
      </footer>
    </div>
  );
}
