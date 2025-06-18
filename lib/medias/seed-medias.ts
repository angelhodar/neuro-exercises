// seed-medias.ts
import 'dotenv/config';

import { list } from '@vercel/blob';
import path from 'path';
import { db } from '../db';
import { medias } from '../db/schema';

async function seedMediaFromBlobs() {
  const author = await db.query.users.findFirst();

  if (!author) {
    console.log('No user found. Exiting.');
    return;
  }

  console.log('Fetching blobs from Vercel...');

  const { blobs } = await list();

  if (blobs.length === 0) {
    console.log('No blobs found. Exiting.');
    return;
  }
  
  console.log(`Found ${blobs.length} blobs. Preparing to insert into database...`);

  // Transform blob data to match the 'medias' table schema
  const mediaDataToInsert = blobs.map((blob) => {
    const filename = path.basename(blob.pathname);
    const category = path.dirname(blob.pathname);

    return {
      name: filename,
      description: null,
      category: category,
      blobKey: blob.pathname,
      authorId: author.id,
      createdAt: blob.uploadedAt,
    };
  });
  
  console.log('--- Data to be inserted ---');
  console.log(mediaDataToInsert);
  console.log('---------------------------');

  console.log('Inserting data into the "medias" table...');
  const result = await db.insert(medias).values(mediaDataToInsert).returning();
  
  console.log(`✅ Successfully inserted ${result.length} records into the database.`);
}

if (require.main === module) {
  seedMediaFromBlobs()
    .catch((err) => {
      console.error('An error occurred during the seeding process:');
      console.error(err);
      process.exit(1);
    })
    .finally(() => {
      // Ensure the script exits
      process.exit(0);
    });
}