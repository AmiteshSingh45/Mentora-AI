import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  console.warn("⚠️  PINECONE_API_KEY is not set. Vector search features will use mock data.");
}

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? "placeholder",
    });
  }
  return pineconeClient;
}

export function getIndex(indexName?: string) {
  const client = getPineconeClient();
  return client.index(indexName ?? process.env.PINECONE_INDEX_NAME ?? "learnai-vectors");
}

/**
 * Get a namespace-scoped index for a specific user + document
 * This provides isolation between users and documents
 */
export function getDocumentNamespace(userId: string, documentId: string) {
  return `user-${userId}-doc-${documentId}`;
}

export interface VectorMetadata {
  userId: string;
  documentId: string;
  page: number;
  chunkIndex: number;
  content: string;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

/**
 * Upsert document chunk vectors to Pinecone
 */
export async function upsertVectors(
  namespace: string,
  vectors: Array<{
    id: string;
    values: number[];
    metadata: VectorMetadata;
  }>
) {
  const index = getIndex();
  const ns = index.namespace(namespace);

  // Batch in groups of 100 (Pinecone limit)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await ns.upsert(batch);
  }
}

/**
 * Semantic search over a document namespace
 */
export async function searchVectors(
  namespace: string,
  queryEmbedding: number[],
  topK: number = 5
): Promise<SearchResult[]> {
  const index = getIndex();
  const ns = index.namespace(namespace);

  const results = await ns.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return (results.matches ?? []).map((match) => ({
    id: match.id,
    score: match.score ?? 0,
    metadata: match.metadata as VectorMetadata,
  }));
}

/**
 * Delete all vectors for a document (when user deletes a PDF)
 */
export async function deleteDocumentVectors(namespace: string) {
  const index = getIndex();
  const ns = index.namespace(namespace);
  await ns.deleteAll();
}
