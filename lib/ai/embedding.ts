import { embed, embedMany } from "ai";

const EMBEDDING_MODEL = "google/gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

const queryEmbeddingCache = new Map<string, number[]>();

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
    value: text,
  });
  return embedding;
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const cached = queryEmbeddingCache.get(query);

  if (cached) {
    return cached;
  }

  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_QUERY",
      },
    },
    value: query,
  });

  queryEmbeddingCache.set(query, embedding);
  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: EMBEDDING_MODEL,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
    values: texts,
  });
  return embeddings;
}
