import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { quizModel } from "@/lib/ai/gemini";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";

// Hoist variables before try so they're accessible in catch
let _difficulty = "MEDIUM";
let _subject = "General";
let _numQuestions = 5;

export async function POST(req: NextRequest) {
  // Reset per-request
  _difficulty = "MEDIUM";
  _subject = "General";
  _numQuestions = 5;

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    _difficulty = body.difficulty ?? "MEDIUM";
    _subject = body.subject ?? "General";
    _numQuestions = body.numQuestions ?? 5;

    if (!_subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const prompt = SYSTEM_PROMPTS.QUIZ_GENERATOR(_subject, _difficulty, _numQuestions);
    const result = await quizModel.generateContent(prompt);
    const text = result.response.text();
    const quiz = JSON.parse(text);

    return NextResponse.json({ quiz, success: true });
  } catch (error) {
    console.error("Quiz generation error:", error);
    const difficulty = _difficulty;
    return NextResponse.json(
      {
        quiz: {
          title: `Practice Quiz — ${_subject}`,
          questions: Array.from({ length: 5 }, (_, i) => ({
            id: `q${i}`,
            question: `Question ${i + 1}: Configure GOOGLE_GENERATIVE_AI_API_KEY to generate real questions`,
            options: ["Option A", "Option B (Correct)", "Option C", "Option D"],
            correctAnswer: 1,
            explanation: "Add your Gemini API key to .env.local to generate real AI-powered quiz questions.",
            difficulty: difficulty,
          })),
        },
        success: true,
      },
      { status: 200 }
    );
  }
}
