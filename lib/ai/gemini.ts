import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn("⚠️  GOOGLE_GENERATIVE_AI_API_KEY is not set. AI features will use mock data.");
}

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "placeholder";

export const genAI = new GoogleGenerativeAI(apiKey);

// Main chat model — Gemini 2.0 Flash (fast, cost-efficient, great for tutoring)
export const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `You are LearnAI, a world-class AI tutor and learning assistant. You are highly knowledgeable, patient, and encouraging. You excel at:
- Breaking down complex concepts with real-world analogies
- Explaining DSA, DBMS, OS, CN, AI/ML, Mathematics, Physics, and interview prep
- Writing clean, well-commented code examples
- Generating targeted quiz questions
- Creating concise, exam-focused notes
- Providing step-by-step solutions

Always structure your responses clearly. Use markdown formatting, code blocks with language tags, and bullet points for lists. When explaining concepts, always provide a real-world analogy first, then the technical definition. Be encouraging and adapt to the user's level.`,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

// Embedding model for RAG
export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

// Quiz generation model — more structured output needed
export const quizModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.3, // Lower temp for more consistent quiz structure
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
  },
});

// Notes summarization model
export const notesModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 8192,
  },
});

/**
 * Generate embeddings for a text string
 * Used for RAG pipeline — PDF chunking and semantic search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const results = await Promise.all(texts.map((t) => generateEmbedding(t)));
  return results;
}
