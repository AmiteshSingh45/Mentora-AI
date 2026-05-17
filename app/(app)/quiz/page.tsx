import type { Metadata } from "next";
import { QuizGeneratorClient } from "./QuizClient";

export const metadata: Metadata = {
  title: "Quiz Generator",
  description: "Generate AI-powered quizzes from any topic or uploaded PDF",
};

export default function QuizPage() {
  return <QuizGeneratorClient />;
}
