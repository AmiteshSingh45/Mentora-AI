import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, topic, studyTime, mastery } = await req.json();

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, xp: true, streak: true, lastActiveAt: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert progress for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.learningProgress.upsert({
      where: {
        userId_subject_topic_date: {
          userId: dbUser.id,
          subject: subject ?? "General",
          topic: topic ?? "General",
          date: today,
        },
      },
      update: {
        studyTime: { increment: studyTime ?? 0 },
        mastery: mastery ?? undefined,
      },
      create: {
        userId: dbUser.id,
        subject: subject ?? "General",
        topic: topic ?? "General",
        mastery: mastery ?? 0,
        studyTime: studyTime ?? 0,
        date: today,
      },
    });

    // Update streak and XP
    const lastActive = new Date(dbUser.lastActiveAt);
    lastActive.setHours(0, 0, 0, 0);
    const daysSinceLastActive = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = dbUser.streak;
    if (daysSinceLastActive === 1) {
      newStreak = dbUser.streak + 1; // consecutive day
    } else if (daysSinceLastActive > 1) {
      newStreak = 1; // reset streak
    }

    const xpGained = Math.min(studyTime ?? 0, 60); // 1 XP per minute, max 60 per session
    await db.user.update({
      where: { id: dbUser.id },
      data: {
        streak: newStreak,
        lastActiveAt: new Date(),
        xp: { increment: xpGained },
      },
    });

    return NextResponse.json({ success: true, streak: newStreak, xpGained });
  } catch (error) {
    console.error("[PROGRESS_API_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    if (!dbUser) return NextResponse.json({ progress: [], heatmap: [] });

    // Last 90 days of progress
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const progress = await db.learningProgress.findMany({
      where: { userId: dbUser.id, date: { gte: ninetyDaysAgo } },
      orderBy: { date: "desc" },
    });

    // Build heatmap data (date → total minutes)
    const heatmapMap = new Map<string, number>();
    progress.forEach((p: { date: Date; studyTime: number }) => {
      const key = p.date.toISOString().split("T")[0];
      heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + p.studyTime);
    });

    const heatmap = Array.from(heatmapMap.entries()).map(([date, minutes]) => ({ date, minutes }));

    return NextResponse.json({ progress, heatmap });
  } catch (error) {
    console.error("[PROGRESS_GET_ERROR]", error);
    return NextResponse.json({ progress: [], heatmap: [] });
  }
}
