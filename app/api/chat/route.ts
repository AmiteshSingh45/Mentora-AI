import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chatModel } from "@/lib/ai/gemini";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { message, sessionId, subject, history = [] } = await req.json();

    if (!message?.trim()) {
      return new Response("Message is required", { status: 400 });
    }

    // Get user + rate limit check
    const user = await db.user
      .findUnique({
        where: { clerkId: userId },
        select: { id: true, plan: true },
      })
      .catch(() => null);

    // Build conversation history for Gemini
    const formattedHistory = history
      .slice(-20) // Last 20 messages for context window
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "USER" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    // Start a chat session with history
    const chat = chatModel.startChat({
      history: formattedHistory,
      systemInstruction:
        subject
          ? `${SYSTEM_PROMPTS.TUTOR}\n\nThe user is currently studying: ${subject}. Focus your explanations and examples around this subject.`
          : SYSTEM_PROMPTS.TUTOR,
    });

    // Create streaming response using SSE (Server-Sent Events)
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(message);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullText += text;
              // Send as SSE data
              const data = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          // Signal end of stream
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          // Save to DB in background (don't await)
          if (user?.id) {
            saveMessagesToDB(user.id, sessionId, message, fullText, subject).catch(
              console.error
            );
          }
        } catch (streamError) {
          console.error("Stream error:", streamError);
          // Send a helpful error message
          const errorMsg =
            streamError instanceof Error && streamError.message.includes("API_KEY")
              ? "API key not configured. Please add your GOOGLE_GENERATIVE_AI_API_KEY to .env.local"
              : "I encountered an error. Please try again.";

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: errorMsg })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

async function saveMessagesToDB(
  userId: string,
  sessionId: string | undefined,
  userMessage: string,
  aiMessage: string,
  subject: string | undefined
) {
  // Find or create session
  let chatSession;

  if (sessionId) {
    chatSession = await db.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
  }

  if (!chatSession) {
    // Auto-generate title from first message
    const title =
      userMessage.length > 60
        ? userMessage.slice(0, 57) + "..."
        : userMessage;

    chatSession = await db.chatSession.create({
      data: { userId, title, subject },
    });
  }

  // Save both messages
  await db.message.createMany({
    data: [
      {
        sessionId: chatSession.id,
        role: "USER",
        content: userMessage,
      },
      {
        sessionId: chatSession.id,
        role: "ASSISTANT",
        content: aiMessage,
      },
    ],
  });

  // Update user's lastActiveAt
  await db.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
  });
}
