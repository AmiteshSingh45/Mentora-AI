import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardClient } from "./DashboardClient";
import type { DashboardStats, WeeklyStudyDay } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized LearnAI learning dashboard",
};

async function getDashboardData(clerkUserId: string): Promise<DashboardStats> {
  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    include: {
      sessions: {
        orderBy: { updatedAt: "desc" },
        take: 5,
      },
      quizAttempts: {
        orderBy: { completedAt: "desc" },
        take: 10,
        include: { quiz: true },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      progress: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!user) {
    // Return mock data for new users / when DB isn't set up yet
    return getMockDashboardData();
  }

  // Calculate weekly study data (last 7 days)
  const weeklyStudyData: WeeklyStudyDay[] = getLast7Days().map((day) => {
    const dayProgress = user.progress.filter(
      (p: { date: Date; studyTime: number }) => p.date.toDateString() === day.date.toDateString()
    );
    return {
      day: day.label,
      minutes: dayProgress.reduce((sum: number, p: { date: Date; studyTime: number }) => sum + p.studyTime, 0),
      sessions: dayProgress.length,
    };
  });

  // Top subjects by mastery
  type ProgressEntry = { subject: string; mastery: number; studyTime: number; date: Date };
  const subjectMap = new Map<string, number[]>();
  (user.progress as ProgressEntry[]).forEach((p) => {
    if (!subjectMap.has(p.subject)) subjectMap.set(p.subject, []);
    subjectMap.get(p.subject)!.push(p.mastery);
  });

  const topSubjects = Array.from(subjectMap.entries())
    .map(([subject, masteries]) => ({
      subject,
      mastery: Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length),
      color: getSubjectColor(subject),
    }))
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 5);

  // Recent activity
  const recentActivity = [
    ...user.quizAttempts.slice(0, 3).map((attempt: { id: string; completedAt: Date; score: number; quiz: { title: string; subject: string } }) => ({
      id: attempt.id,
      type: "QUIZ" as const,
      title: `Completed Quiz: ${attempt.quiz.title}`,
      detail: `Score: ${Math.round(attempt.score)}% • ${attempt.quiz.subject}`,
      timestamp: attempt.completedAt,
      score: attempt.score,
    })),
    ...user.documents.slice(0, 2).map((doc: { id: string; name: string; pageCount: number | null; createdAt: Date }) => ({
      id: doc.id,
      type: "PDF" as const,
      title: `PDF: ${doc.name}`,
      detail: `${doc.pageCount ?? "?"} pages • Analyzed`,
      timestamp: doc.createdAt,
    })),
    ...user.sessions.slice(0, 2).map((session: { id: string; title: string; subject: string | null; updatedAt: Date }) => ({
      id: session.id,
      type: "CHAT" as const,
      title: `AI Session: ${session.title}`,
      detail: session.subject ?? "General",
      timestamp: session.updatedAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 6);

  const totalStudyTime = weeklyStudyData.reduce((sum: number, d) => sum + d.minutes, 0);
  const avgQuizScore = user.quizAttempts.length
    ? user.quizAttempts.reduce((sum: number, a: { score: number }) => sum + a.score, 0) / user.quizAttempts.length
    : 0;

  return {
    streak: user.streak,
    longestStreak: user.longestStreak,
    xp: user.xp,
    level: Math.floor(user.xp / 100) + 1,
    xpProgress: user.xp % 100,
    totalStudyTime,
    quizzesCompleted: user.quizAttempts.length,
    documentsUploaded: user.documents.length,
    sessionsThisWeek: user.sessions.filter(
      (s: { updatedAt: Date }) => s.updatedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    weeklyStudyData,
    topSubjects,
    recentActivity,
    aiRecommendation: getAIRecommendation(avgQuizScore, topSubjects),
  };
}

function getLast7Days() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return { date, label: days[date.getDay()] };
  });
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    "Data Structures": "#adc6ff",
    "Algorithms": "#ddb7ff",
    "DBMS": "#ffb786",
    "OS": "#4ade80",
    "CN": "#fb923c",
    "AI/ML": "#a78bfa",
  };
  return colors[subject] ?? "#adc6ff";
}

function getAIRecommendation(avgScore: number, topSubjects: { subject: string; mastery: number }[]) {
  const weakSubject = topSubjects.sort((a, b) => a.mastery - b.mastery)[0];
  if (!weakSubject) return null;

  return {
    topic: `${weakSubject.subject} Deep Dive`,
    subject: weakSubject.subject,
    reason: `Your mastery in ${weakSubject.subject} is at ${weakSubject.mastery}%. A focused session will significantly improve your score.`,
    duration: 45,
    xpGain: 250,
    difficulty: avgScore > 70 ? "MEDIUM" : "EASY",
    focus: "Conceptual Review",
  } as const;
}

function getMockDashboardData(): DashboardStats {
  return {
    streak: 14,
    longestStreak: 21,
    xp: 3420,
    level: 35,
    xpProgress: 20,
    totalStudyTime: 320,
    quizzesCompleted: 47,
    documentsUploaded: 8,
    sessionsThisWeek: 12,
    weeklyStudyData: [
      { day: "MON", minutes: 35, sessions: 2 },
      { day: "TUE", minutes: 65, sessions: 3 },
      { day: "WED", minutes: 90, sessions: 4 },
      { day: "THU", minutes: 45, sessions: 3 },
      { day: "FRI", minutes: 55, sessions: 2 },
      { day: "SAT", minutes: 20, sessions: 1 },
      { day: "SUN", minutes: 10, sessions: 1 },
    ],
    topSubjects: [
      { subject: "Algorithms", mastery: 82, color: "#adc6ff" },
      { subject: "DBMS", mastery: 71, color: "#ddb7ff" },
      { subject: "OS", mastery: 65, color: "#ffb786" },
      { subject: "CN", mastery: 58, color: "#4ade80" },
      { subject: "AI/ML", mastery: 45, color: "#a78bfa" },
    ],
    recentActivity: [
      { id: "1", type: "QUIZ", title: "Completed Quiz: Intro Physics", detail: "Score: 92% • 2 hours ago", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), score: 92 },
      { id: "2", type: "PDF", title: "PDF Analysis: Neurobiology_Ch4.pdf", detail: "Summarized 42 pages • 5 hours ago", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { id: "3", type: "CHAT", title: "AI Tutor: Linear Algebra", detail: "Voice interaction (15:20) • Yesterday", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: "4", type: "QUIZ", title: "Completed Quiz: Quantum Computing", detail: "Score: 78% • 2 days ago", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), score: 78 },
    ],
    aiRecommendation: {
      topic: "Wave-Particle Duality",
      subject: "Quantum Mechanics",
      reason: "Based on your recent quiz performance, focusing 45 minutes on this topic will bridge your knowledge gap.",
      duration: 45,
      xpGain: 250,
      difficulty: "MEDIUM",
      focus: "Theory",
    },
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const stats = await getDashboardData(userId).catch(() => getMockDashboardData());

  return <DashboardClient stats={stats} />;
}
