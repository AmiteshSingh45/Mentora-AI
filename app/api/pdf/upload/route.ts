import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { processPDF } from "@/lib/pdf/parser";
import { embedAndStoreChunks } from "@/lib/rag/retrieval";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, plan: true, _count: { select: { documents: true } } },
    }).catch(() => null);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found. Please complete onboarding." }, { status: 404 });
    }

    // Plan-based PDF limits
    const pdfLimits: Record<string, number> = { FREE: 2, PRO: 20, PREMIUM: 100 };
    const limit = pdfLimits[dbUser.plan] ?? 2;
    if (dbUser._count.documents >= limit) {
      return NextResponse.json(
        { error: `PDF limit reached. Upgrade your plan to upload more documents.` },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    // Create DB record first
    const document = await db.document.create({
      data: {
        userId: dbUser.id,
        name: file.name,
        fileUrl: "", // will update after processing
        fileKey: `${dbUser.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        fileSize: file.size,
        status: "PROCESSING",
      },
    });

    // Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    let chunks;
    try {
      const result = await processPDF(buffer);
      chunks = result.chunks;
    } catch {
      await db.document.update({ where: { id: document.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "Failed to parse PDF. Please ensure it contains text." }, { status: 422 });
    }

    // Store file URL (using file name as placeholder — in production use UploadThing)
    const fileUrl = `/api/pdf/${document.id}/file`;

    // Embed and store in Pinecone (async, non-blocking in production)
    try {
      await embedAndStoreChunks(document.id, dbUser.id, chunks);
    } catch (embedErr) {
      console.error("Embedding failed (non-fatal):", embedErr);
      // Still mark as READY — vector search won't work but PDF metadata will
    }

    const updated = await db.document.update({
      where: { id: document.id },
      data: {
        fileUrl,
        pageCount: chunks.length > 0 ? Math.max(...chunks.map((c) => c.page)) : null,
        status: "READY",
        vectorNs: `user-${dbUser.id}-doc-${document.id}`,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      status: updated.status,
      pageCount: updated.pageCount,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("[PDF_UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
