import "dotenv/config";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema";
import { eq, notLike } from "drizzle-orm";
import { copy, del } from '@vercel/blob';

// Set this to true only when you are ready to delete the old blobs.
// BE CAREFUL: This is a destructive operation.
const ENABLE_DELETION = true;

async function main() {
  console.log("🚀 Starting media blob migration script...");
  if (ENABLE_DELETION) {
    console.warn("DELETION IS ENABLED. Old blobs will be permanently removed.");
  } else {
    console.info("Deletion is disabled. Old blobs will not be removed.");
  }

  // 1. Find all media that have not been migrated yet.
  const mediaToMigrate = await db.query.medias.findMany({
    where: notLike(medias.blobKey, 'library/%'),
  });

  if (mediaToMigrate.length === 0) {
    console.log("✅ No media blobs to migrate.");
    return;
  }

  console.log(`🔍 Found ${mediaToMigrate.length} media items to migrate.`);

  const oldKeysToDelete: string[] = [];

  for (const media of mediaToMigrate) {
    try {
      console.log(`\nProcessing media ID: ${media.id} | Old key: ${media.blobKey}`);

      const oldKey = media.blobKey;
      const fileName = oldKey.split('/').pop();
      if (!fileName) {
        throw new Error(`Could not extract filename from key: ${oldKey}`);
      }

      const newKey = `library/${fileName}`;
      
      console.log(`  - Copying blob from '${oldKey}' to '${newKey}'...`);

      // 1. Copy the blob to the new location using relative paths
      const copyResult = await copy(oldKey, newKey, {
        access: 'public',
      });

      if (!copyResult.pathname) {
        throw new Error(`Failed to copy blob for media ID: ${media.id}`);
      }
      
      console.log(`  - Successfully copied to: ${copyResult.pathname}`);

      // 2. Update the database with the new key
      console.log(`  - Updating database record...`);
      await db
        .update(medias)
        .set({ blobKey: newKey })
        .where(eq(medias.id, media.id));

      // 3. Add the old key to the list for batch deletion
      oldKeysToDelete.push(oldKey);

      console.log(`✅ Successfully queued migration for media ID: ${media.id}`);

    } catch (error) {
      console.error(`❌ Failed to process media ID: ${media.id}. Error: ${(error as Error).message}`);
    }
  }

  // 4. Batch delete all the old blobs that were successfully migrated
  if (ENABLE_DELETION && oldKeysToDelete.length > 0) {
    console.log(`\nDeleting ${oldKeysToDelete.length} old blobs in batch...`);
    try {
      await del(oldKeysToDelete);
      console.log("✅ Batch deletion successful.");
    } catch (error) {
      console.error(`❌ Failed to delete blobs in batch. Please check manually: ${oldKeysToDelete.join(", ")}`, error);
    }
  } else if (oldKeysToDelete.length > 0) {
    console.log(`\n✅ Skipped deletion of ${oldKeysToDelete.length} old blobs because ENABLE_DELETION is false.`);
    console.log("  - Blobs to delete manually:", oldKeysToDelete.join(", "));
  }

  console.log("\n✨ Migration script finished!");
}

main().catch((error) => {
  console.error("An unexpected error occurred during migration:", error);
  process.exit(1);
}); 