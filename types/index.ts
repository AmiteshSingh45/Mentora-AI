// ==========================================
// LearnAI — Core Type Definitions
// ==========================================

export type Plan = "FREE" | "PRO" | "PREMIUM";
export type MessageRole = "USER" | "ASSISTANT";
export type DocStatus = "PROCESSING" | "READY" | "FAILED";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuizSource = "PDF" | "TOPIC" | "CHAT";
export type NoteFormat = "MARKDOWN" | "PDF" | "BULLETS";
export type SubStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE";

// ---- User ----
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  plan: Plan;
  streak: number;
  longestStreak: number;
  xp: number;
  lastActiveAt: Date;
  createdAt: Date;
}

// ---- Chat ----
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  subject: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata | null;
  createdAt: Date;
}

export interface MessageMetadata {
  sources?: PDFSource[];
  codeBlocks?: string[];
  subject?: string;
}

export interface PDFSource {
  documentId: string;
  documentName: string;
  page: number;
  excerpt: string;
  score: number;
}

// ---- Documents ----
export interface Document {
  id: string;
  userId: string;
  name: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  pageCount: number | null;
  status: DocStatus;
  vectorNs: string | null;
  summary: string | null;
  createdAt: Date;
}

// ---- Quiz ----
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
  difficulty: Difficulty;
}

export interface Quiz {
  id: string;
  userId: string;
  title: string;
  subject: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  source: QuizSource;
  sourceId: string | null;
  createdAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  timeTaken: number; // seconds
  completedAt: Date;
}

// ---- Notes ----
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  format: NoteFormat;
  subject: string | null;
  tags: string[];
  sourceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Progress ----
export interface LearningProgress {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  mastery: number; // 0-100
  studyTime: number; // minutes
  date: Date;
}

export interface DashboardStats {
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
  xpProgress: number;
  totalStudyTime: number; // minutes this week
  quizzesCompleted: number;
  documentsUploaded: number;
  sessionsThisWeek: number;
  weeklyStudyData: WeeklyStudyDay[];
  topSubjects: SubjectMastery[];
  recentActivity: ActivityItem[];
  aiRecommendation: AIRecommendation | null;
}

export interface WeeklyStudyDay {
  day: string;
  minutes: number;
  sessions: number;
}

export interface SubjectMastery {
  subject: string;
  mastery: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: "QUIZ" | "PDF" | "CHAT" | "NOTE";
  title: string;
  detail: string;
  timestamp: Date;
  score?: number;
}

export interface AIRecommendation {
  topic: string;
  subject: string;
  reason: string;
  duration: number; // minutes
  xpGain: number;
  difficulty: Difficulty;
  focus: string;
}

// ---- Subscription ----
export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubId: string;
  plan: Plan;
  status: SubStatus;
  currentPeriodEnd: Date;
}

// ---- API Response Types ----
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---- Voice ----
export interface VoiceSession {
  id: string;
  transcript: TranscriptEntry[];
  isRecording: boolean;
  duration: number;
}

export interface TranscriptEntry {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

// ---- Subjects (for UI) ----
export const SUBJECTS = [
  "Data Structures & Algorithms",
  "Database Management",
  "Operating Systems",
  "Computer Networks",
  "AI / Machine Learning",
  "Aptitude & Reasoning",
  "System Design",
  "Web Development",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Beginner",
  MEDIUM: "Intermediate",
  HARD: "Advanced",
};

export const PLAN_LIMITS: Record<Plan, { chat: number; pdf: number; quiz: number }> = {
  FREE: { chat: 5, pdf: 2, quiz: 3 },
  PRO: { chat: 100, pdf: 20, quiz: 50 },
  PREMIUM: { chat: 1000, pdf: 100, quiz: 500 },
};
