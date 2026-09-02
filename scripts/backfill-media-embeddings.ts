import "dotenv/config";

import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema";

const BATCH_SIZE = 10;

async function main() {
  const rows = await db
    .select({
      description: medias.description,
      id: medias.id,
    })
    .from(medias)
    .where(and(isNull(medias.embedding), isNotNull(medias.description)));

  console.log(`Found ${rows.length} media rows to backfill`);

  async function processBatches(start: number): Promise<void> {
    const batch = rows.slice(start, start + BATCH_SIZE);

    if (batch.length === 0) {
      return;
    }

    const texts = batch.map((row) => row.description as string);

    const embeddings = await generateEmbeddings(texts);

    await Promise.all(
      batch.map((row, idx) =>
        db
          .update(medias)
          .set({ embedding: embeddings[idx] })
          .where(eq(medias.id, row.id))
      )
    );

    console.log(
      `Backfilled ${Math.min(start + BATCH_SIZE, rows.length)}/${rows.length}`
    );

    await processBatches(start + BATCH_SIZE);
  }

  await processBatches(0);

  console.log("Done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
