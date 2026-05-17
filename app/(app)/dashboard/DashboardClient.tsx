"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GlassCard, ProgressBar, GradientBadge, EmptyState } from "@/components/shared/GlassCard";
import { formatRelativeTime, getMasteryColor } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { cn } from "@/lib/utils";

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface DashboardClientProps {
  stats: DashboardStats;
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  const maxMinutes = Math.max(...stats.weeklyStudyData.map((d) => d.minutes), 1);

  const activityIcons: Record<string, string> = {
    QUIZ: "quiz",
    PDF: "description",
    CHAT: "chat_spark",
    NOTE: "edit_note",
  };

  const activityColors: Record<string, string> = {
    QUIZ: "var(--color-primary)",
    PDF: "var(--color-secondary)",
    CHAT: "var(--color-tertiary)",
    NOTE: "#4ade80",
  };

  return (
    <motion.div
      className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 space-y-6"
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
    >
      {/* ==========================================
          Hero: Greeting + Streak
         ========================================== */}
      <motion.section
        variants={ITEM_VARIANTS}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6"
      >
        <div>
          <h2 className="text-headline-lg text-on-surface">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-body-lg text-on-surface-variant mt-1 max-w-xl">
            {stats.sessionsThisWeek > 0
              ? `You've had ${stats.sessionsThisWeek} sessions this week. Your AI co-pilot is ready.`
              : "Start your first session today and begin your learning journey."}
          </p>
        </div>

        {/* Streak Card */}
        <GlassCard
          className="flex items-center gap-5 px-6 py-4 min-w-[280px] border border-orange-500/20"
          glow="primary"
          animate={false}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
            <span
              className="material-symbols-outlined text-[48px] text-orange-400 relative z-10 animate-streak"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
          </div>
          <div>
            <p className="text-label-caps text-secondary">CURRENT STREAK</p>
            <p className="text-headline-md text-on-surface font-bold">{stats.streak} Days</p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < Math.min(stats.streak, 5) ? "bg-orange-400" : "bg-outline-variant/30"
                  )}
                />
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.section>

      {/* ==========================================
          Stats Row
         ========================================== */}
      <motion.div
        variants={ITEM_VARIANTS}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Study Time", value: `${Math.round(stats.totalStudyTime / 60)}h ${stats.totalStudyTime % 60}m`, icon: "schedule", color: "var(--color-primary)" },
          { label: "Quizzes Done", value: stats.quizzesCompleted, icon: "quiz", color: "var(--color-secondary)" },
          { label: "PDFs Analyzed", value: stats.documentsUploaded, icon: "description", color: "var(--color-tertiary)" },
          { label: "XP Earned", value: `${stats.xp.toLocaleString()} XP`, icon: "stars", color: "#4ade80" },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 flex flex-col gap-3" animate={false}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: stat.color }}
              >
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="text-[28px] font-bold text-on-surface leading-none">{stat.value}</p>
              <p className="text-label-sm text-on-surface-variant mt-1">{stat.label}</p>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* ==========================================
          Main Grid: Chart + Upcoming
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Statistics Chart */}
        <motion.div variants={ITEM_VARIANTS} className="lg:col-span-2">
          <GlassCard className="p-6 h-full" animate={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md text-on-surface">Study Statistics</h3>
              <div className="flex gap-2">
                <GradientBadge variant="primary">Weekly</GradientBadge>
                <button className="p-1 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyStudyData} barSize={28} barCategoryGap="30%">
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8c909f", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="glass-card px-3 py-2 rounded-xl border border-primary/20">
                          <p className="text-label-sm text-primary font-bold">{payload[0].value} min</p>
                          <p className="text-[10px] text-on-surface-variant">{payload[0].payload.sessions} sessions</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                    {stats.weeklyStudyData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          entry.minutes === maxMinutes
                            ? "url(#primaryGradient)"
                            : "rgba(173, 198, 255, 0.15)"
                        }
                      />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4d8eff" />
                      <stop offset="100%" stopColor="#6f00be" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Mastery */}
            <div className="mt-6 space-y-3">
              <p className="text-label-caps text-outline">SUBJECT MASTERY</p>
              {stats.topSubjects.slice(0, 3).map((subject) => (
                <div key={subject.subject} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-label-sm text-on-surface">{subject.subject}</span>
                    <span className="text-label-sm" style={{ color: getMasteryColor(subject.mastery) }}>
                      {subject.mastery}%
                    </span>
                  </div>
                  <ProgressBar value={subject.mastery} color={subject.color} />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Upcoming / Quick Actions */}
        <motion.div variants={ITEM_VARIANTS}>
          <GlassCard className="p-6 h-full flex flex-col" animate={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md text-on-surface">Quick Start</h3>
              <span className="material-symbols-outlined text-primary">bolt</span>
            </div>

            <div className="space-y-3 flex-grow">
              {[
                { href: "/chat", icon: "chat_spark", label: "Ask AI Tutor", sub: "Start a new session", color: "var(--color-primary)" },
                { href: "/pdf", icon: "upload_file", label: "Upload PDF", sub: "Analyze a document", color: "var(--color-secondary)" },
                { href: "/quiz", icon: "quiz", label: "Take a Quiz", sub: "Test your knowledge", color: "var(--color-tertiary)" },
                { href: "/notes", icon: "edit_note", label: "Generate Notes", sub: "Create study notes", color: "#4ade80" },
                { href: "/voice", icon: "keyboard_voice", label: "Voice Lab", sub: "Practice speaking", color: "#fb923c" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-3.5 rounded-xl border border-outline-variant/10 bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ color: action.color }}
                      >
                        {action.icon}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-label-sm font-bold text-on-surface">{action.label}</p>
                      <p className="text-[11px] text-on-surface-variant">{action.sub}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-on-surface transition-colors text-[18px]">
                      chevron_right
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ==========================================
          AI Recommendation Banner
         ========================================== */}
      {stats.aiRecommendation && (
        <motion.div variants={ITEM_VARIANTS}>
          <GlassCard
            className="p-6 lg:p-8 relative overflow-hidden border border-primary/10 bg-gradient-to-br from-surface-container-lowest to-surface"
            animate={false}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              {/* Left */}
              <div className="lg:w-1/2">
                <GradientBadge variant="secondary" className="mb-4">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  AI RECOMMENDATION
                </GradientBadge>
                <h3 className="text-headline-md text-on-surface mb-2">
                  {stats.aiRecommendation.topic}
                </h3>
                <p className="text-body-md text-on-surface-variant mb-6 max-w-md">
                  {stats.aiRecommendation.reason}
                </p>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:shadow-[0_0_20px_rgba(173,198,255,0.3)] transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_circle</span>
                    Start Focused Session
                  </motion.button>
                </Link>
              </div>

              {/* Right: Session Meta */}
              <div className="lg:w-1/2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { icon: "schedule", label: "DURATION", value: `${stats.aiRecommendation.duration} Min`, color: "var(--color-tertiary)" },
                  { icon: "trending_up", label: "XP GAIN", value: `+${stats.aiRecommendation.xpGain} XP`, color: "var(--color-primary)" },
                  { icon: "auto_awesome", label: "DIFFICULTY", value: stats.aiRecommendation.difficulty, color: "var(--color-secondary)" },
                  { icon: "psychology", label: "FOCUS", value: stats.aiRecommendation.focus, color: "var(--color-on-surface)" },
                ].map((meta, i) => (
                  <GlassCard
                    key={i}
                    className="aspect-square flex flex-col items-center justify-center p-4 text-center"
                    animate={false}
                  >
                    <span
                      className="material-symbols-outlined mb-2 text-[22px]"
                      style={{ color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    <p className="text-label-caps text-on-surface-variant mb-0.5">{meta.label}</p>
                    <p className="text-label-sm font-bold text-on-surface">{meta.value}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ==========================================
          Recent Activity
         ========================================== */}
      <motion.div variants={ITEM_VARIANTS}>
        <GlassCard className="p-6" animate={false}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-headline-md text-on-surface">Recent Activity</h3>
            <button className="text-label-sm text-primary hover:text-secondary transition-colors">
              View All
            </button>
          </div>

          {stats.recentActivity.length === 0 ? (
            <EmptyState
              icon="history"
              title="No activity yet"
              description="Start a session, upload a PDF, or take a quiz to see your activity here."
              action={
                <Link href="/chat">
                  <button className="px-6 py-2.5 btn-gradient rounded-xl text-on-primary font-bold text-label-sm">
                    Start First Session
                  </button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-1">
              {stats.recentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-surface-variant/30 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-1.5 h-10 rounded-full"
                      style={{ backgroundColor: activityColors[activity.type] }}
                    />
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${activityColors[activity.type]}15` }}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ color: activityColors[activity.type] }}
                      >
                        {activityIcons[activity.type]}
                      </span>
                    </div>
                    <div>
                      <p className="text-label-sm font-bold text-on-surface">{activity.title}</p>
                      <p className="text-[11px] text-on-surface-variant">{activity.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-outline hidden sm:block">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                    {activity.score !== undefined && (
                      <span
                        className="text-label-sm font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: getMasteryColor(activity.score),
                          backgroundColor: `${getMasteryColor(activity.score)}15`,
                        }}
                      >
                        {Math.round(activity.score)}%
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
