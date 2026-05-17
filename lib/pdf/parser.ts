/**
 * PDF Text Extraction & Chunking Pipeline
 *
 * Flow: File Buffer → Pages → Chunks (512 tokens, 50 overlap) → Ready for embedding
 */

export interface PDFChunk {
  content: string;
  page: number;
  chunkIndex: number;
  tokenCount: number;
}

export interface PDFParseResult {
  text: string;
  pages: string[];
  pageCount: number;
  chunks: PDFChunk[];
}

/**
 * Extract text from a PDF buffer
 * Uses dynamic import to avoid build issues with pdf-parse
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pages: string[]; pageCount: number }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");

  const pages: string[] = [];

  const result = await pdfParse(buffer, {
    // Page render callback to capture per-page text
    pagerender: (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string; hasEOL: boolean }> }> }) => {
      return pageData.getTextContent().then((content) => {
        const pageText = content.items
          .map((item) => item.str + (item.hasEOL ? "\n" : " "))
          .join("");
        pages.push(pageText.trim());
        return pageText;
      });
    },
  });

  return {
    text: result.text,
    pages,
    pageCount: result.numpages,
  };
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 chars)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split text into overlapping chunks for better RAG retrieval
 *
 * Strategy:
 * - Target chunk size: 512 tokens (~2048 chars)
 * - Overlap: 50 tokens (~200 chars) to avoid losing context at boundaries
 * - Split on sentence boundaries when possible
 */
export function chunkText(
  pages: string[],
  targetTokens: number = 512,
  overlapTokens: number = 50
): PDFChunk[] {
  const chunks: PDFChunk[] = [];
  const targetChars = targetTokens * 4;
  const overlapChars = overlapTokens * 4;

  pages.forEach((pageText, pageIndex) => {
    if (!pageText.trim()) return;

    // Split into sentences first
    const sentences = pageText.split(/(?<=[.!?])\s+/);
    let currentChunk = "";
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const potentialChunk = currentChunk + (currentChunk ? " " : "") + sentence;

      if (potentialChunk.length > targetChars && currentChunk) {
        // Save current chunk
        chunks.push({
          content: currentChunk.trim(),
          page: pageIndex + 1,
          chunkIndex: chunkIndex++,
          tokenCount: estimateTokens(currentChunk),
        });

        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-overlapChars);
        currentChunk = overlapText + " " + sentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Push remaining text as final chunk for this page
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        page: pageIndex + 1,
        chunkIndex: chunkIndex++,
        tokenCount: estimateTokens(currentChunk),
      });
    }
  });

  return chunks.filter((c) => c.content.length > 50); // Filter noise
}

/**
 * Full pipeline: Buffer → Chunks ready for embedding
 */
export async function processPDF(buffer: Buffer): Promise<PDFParseResult> {
  const { text, pages, pageCount } = await extractTextFromPDF(buffer);
  const chunks = chunkText(pages);

  return { text, pages, pageCount, chunks };
}
