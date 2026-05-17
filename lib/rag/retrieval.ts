import { generateEmbedding } from "@/lib/ai/gemini";
import {
  upsertVectors,
  searchVectors,
  getDocumentNamespace,
  type SearchResult,
} from "@/lib/rag/pinecone";
import type { PDFChunk } from "@/lib/pdf/parser";

/**
 * Embed all PDF chunks and store in Pinecone
 * Called after PDF parsing is complete
 */
export async function embedAndStoreChunks(
  userId: string,
  documentId: string,
  chunks: PDFChunk[]
): Promise<void> {
  const namespace = getDocumentNamespace(userId, documentId);

  // Generate embeddings in batches of 20 to avoid rate limits
  const batchSize = 20;
  const allVectors: Array<{
    id: string;
    values: number[];
    metadata: {
      userId: string;
      documentId: string;
      page: number;
      chunkIndex: number;
      content: string;
    };
  }> = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const embeddings = await Promise.all(
      batch.map((chunk) => generateEmbedding(chunk.content))
    );

    const vectors = batch.map((chunk, idx) => ({
      id: `${documentId}-p${chunk.page}-c${chunk.chunkIndex}`,
      values: embeddings[idx],
      metadata: {
        userId,
        documentId,
        page: chunk.page,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
      },
    }));

    allVectors.push(...vectors);

    // Small delay between batches to respect rate limits
    if (i + batchSize < chunks.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  await upsertVectors(namespace, allVectors);
}

/**
 * Retrieve relevant context for a user's question about a specific document
 */
export async function retrieveRelevantChunks(
  userId: string,
  documentId: string,
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const namespace = getDocumentNamespace(userId, documentId);
  const queryEmbedding = await generateEmbedding(query);
  return searchVectors(namespace, queryEmbedding, topK);
}

/**
 * Build the RAG context string from retrieved chunks
 * Formats chunks with page citations for the AI model
 */
export function buildRAGContext(chunks: SearchResult[]): string {
  if (!chunks.length) return "No relevant context found in the document.";

  return chunks
    .sort((a, b) => b.score - a.score)
    .map(
      (chunk, i) =>
        `[Context ${i + 1} — Page ${chunk.metadata.page}]\n${chunk.metadata.content}`
    )
    .join("\n\n---\n\n");
}
