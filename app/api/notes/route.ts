import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { notesModel } from "@/lib/ai/gemini";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { db } from "@/lib/db";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, subject, format = "MARKDOWN", documentId } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, plan: true },
    }).catch(() => null);

    // Build the prompt
    const formatInstructions = {
      MARKDOWN: "Format the notes as clean, structured Markdown with headers (##), bullet points, code blocks, and emphasis.",
      BULLETS: "Format the notes as clean bullet points only. Use • for main points and  ◦ for sub-points.",
      PDF: "Format the notes as clean, structured Markdown suitable for PDF export.",
    };

    const prompt = `Generate comprehensive study notes on: "${topic}"${subject ? ` (Subject: ${subject})` : ""}.

${formatInstructions[format as keyof typeof formatInstructions] ?? formatInstructions.MARKDOWN}

Include:
1. Key concepts and definitions
2. Important formulas or algorithms (if applicable)  
3. Real-world examples or analogies
4. Common exam questions or pitfalls
5. Quick summary at the end

Make these notes exam-ready, comprehensive, and well-structured.`;

    const chat = notesModel.startChat({
      systemInstruction: SYSTEM_PROMPTS.NOTES,
    });

    const result = await chat.sendMessage(prompt);
    const content = result.response.text();

    // Save to DB if user exists
    let savedNote = null;
    if (dbUser) {
      savedNote = await db.note.create({
        data: {
          userId: dbUser.id,
          title: `${topic}${subject ? ` — ${subject}` : ""}`,
          content,
          format: format as "MARKDOWN" | "BULLETS" | "PDF",
          subject: subject ?? null,
          tags: subject ? [subject, topic.split(" ")[0]] : [topic.split(" ")[0]],
          sourceId: documentId ?? null,
        },
      }).catch((e: unknown) => {
        console.error("Failed to save note:", e);
        return null;
      });
    }

    return NextResponse.json({
      content,
      noteId: savedNote?.id ?? null,
      title: `${topic}${subject ? ` — ${subject}` : ""}`,
    });
  } catch (error) {
    console.error("[NOTES_API_ERROR]", error);

    // Return mock notes if AI fails
    return NextResponse.json({
      content: `# ${(await req.clone().json().catch(() => ({ topic: "Notes" }))).topic ?? "Notes"}

## Overview
Your AI-generated notes will appear here once the API is configured.

## Key Concepts
- Add your GOOGLE_GENERATIVE_AI_API_KEY to .env.local to enable AI notes generation
- Notes are saved automatically and can be exported as PDF or Markdown

## Getting Started
1. Set up your API keys in \`.env.local\`
2. Enter any topic in the notes generator
3. Get comprehensive, exam-ready notes instantly

## Quick Summary
Configure your environment variables to unlock full AI notes generation.`,
      noteId: null,
      title: "Setup Required",
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    }).catch(() => null);

    if (!dbUser) return NextResponse.json({ notes: [] });

    const notes = await db.note.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, subject: true, format: true, tags: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("[NOTES_GET_ERROR]", error);
    return NextResponse.json({ notes: [] });
  }
}
