import "dotenv/config";

import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema";

const BATCH_SIZE = 10;

async function main() {
  const rows = await db
    .select({
      id: medias.id,
      description: medias.description,
    })
    .from(medias)
    .where(and(isNull(medias.embedding), isNotNull(medias.description)));

  console.log(`Found ${rows.length} media rows to backfill`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
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
      `Backfilled ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`
    );
  }

  console.log("Done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
