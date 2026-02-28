CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
CREATE INDEX "medias_embedding_idx" ON "medias" USING hnsw ("embedding" vector_cosine_ops);