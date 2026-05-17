import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { quizModel } from "@/lib/ai/gemini";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, difficulty, numQuestions } = await req.json();

    if (!subject || !difficulty || !numQuestions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = SYSTEM_PROMPTS.QUIZ_GENERATOR(subject, difficulty, numQuestions);

    const result = await quizModel.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response from Gemini
    const quiz = JSON.parse(text);

    return NextResponse.json({ quiz, success: true });
  } catch (error) {
    console.error("Quiz generation error:", error);
    // Return a mock quiz if API isn't configured
    return NextResponse.json(
      {
        quiz: {
          title: `Generated Quiz`,
          questions: Array.from({ length: 5 }, (_, i) => ({
            id: `q${i}`,
            question: `Question ${i + 1}: Configure GOOGLE_GENERATIVE_AI_API_KEY to generate real questions`,
            options: ["Option A", "Option B (Correct)", "Option C", "Option D"],
            correctAnswer: 1,
            explanation: "Add your Gemini API key to .env.local to generate real AI-powered quiz questions.",
            difficulty,
          })),
        },
        success: true,
      },
      { status: 200 }
    );
  }
}
