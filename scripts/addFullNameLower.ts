import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, getDocs, writeBatch, doc, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config Check:');
console.log('  Project ID:', firebaseConfig.projectId || 'MISSING');
console.log('  API Key:', firebaseConfig.apiKey ? 'SET' : 'MISSING');
console.log('');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuration
const BATCH_SIZE = 500; // Firestore batch limit
const QUERY_LIMIT = 1000; // Documents to fetch per query
const PROGRESS_FILE = 'migration-progress-california.json';
const STATE_FILTER = 'california'; // Only process California documents

interface Progress {
  totalProcessed: number;
  totalUpdated: number;
  totalSkipped: number;
  lastProcessedDoc?: string;
  errors: number;
  startTime: string;
  lastUpdateTime: string;
}

// Load progress from file
function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  }
  return {
    totalProcessed: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    errors: 0,
    startTime: new Date().toISOString(),
    lastUpdateTime: new Date().toISOString(),
  };
}

// Save progress to file
function saveProgress(progress: Progress) {
  progress.lastUpdateTime = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function migrateDocuments() {
  console.log('=== Starting Full Name Lower Migration ===');
  console.log(`State Filter: ${STATE_FILTER}\n`);

  const progress = loadProgress();

  if (progress.totalProcessed > 0) {
    console.log('Resuming from previous run:');
    console.log(`  Already processed: ${progress.totalProcessed} documents`);
    console.log(`  Updated: ${progress.totalUpdated}`);
    console.log(`  Skipped: ${progress.totalSkipped}`);
    console.log(`  Errors: ${progress.errors}`);
    console.log(`  Started: ${progress.startTime}\n`);
  }

  const officersRef = collectionGroup(db, 'db_launch');
  let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  let hasMore = true;
  let consecutiveEmptyBatches = 0;

  while (hasMore) {
    try {
      // Build query with state filter
      let q = query(
        officersRef,
        where('state', '==', STATE_FILTER),
        limit(QUERY_LIMIT)
      );

      if (lastDoc) {
        q = query(
          officersRef,
          where('state', '==', STATE_FILTER),
          startAfter(lastDoc),
          limit(QUERY_LIMIT)
        );
      }

      // Fetch documents
      console.log(`Fetching next batch (limit: ${QUERY_LIMIT})...`);
      const snapshot = await getDocs(q);

      if (snapshot.empty || snapshot.docs.length === 0) {
        consecutiveEmptyBatches++;
        console.log(`No more documents found (empty batch #${consecutiveEmptyBatches})`);

        if (consecutiveEmptyBatches >= 3) {
          console.log('Multiple empty batches - migration complete');
          hasMore = false;
          break;
        }
        continue;
      }

      consecutiveEmptyBatches = 0;
      console.log(`Fetched ${snapshot.docs.length} documents`);

      // Process documents in batches of 500
      const docsToProcess = snapshot.docs;
      let batchUpdated = 0;
      let batchSkipped = 0;

      for (let i = 0; i < docsToProcess.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const batchDocs = docsToProcess.slice(i, i + BATCH_SIZE);
        let batchHasUpdates = false;

        for (const docSnapshot of batchDocs) {
          const data = docSnapshot.data();

          // Skip if already has full_name_lower
          if (data.full_name_lower !== undefined) {
            batchSkipped++;
            progress.totalSkipped++;
            continue;
          }

          // Skip if missing required fields
          if (!data.first_name || !data.last_name) {
            console.warn(`Skipping document ${docSnapshot.id}: missing first_name or last_name`);
            batchSkipped++;
            progress.totalSkipped++;
            continue;
          }

          // Create full_name_lower
          const fullNameLower = `${data.first_name} ${data.last_name}`.toLowerCase();

          // Update document
          batch.update(docSnapshot.ref, {
            full_name_lower: fullNameLower
          });

          batchUpdated++;
          batchHasUpdates = true;
        }

        // Commit batch if it has updates
        if (batchHasUpdates) {
          await batch.commit();
          progress.totalUpdated += batchUpdated;
          console.log(`  Committed batch: ${batchUpdated} updated, ${batchSkipped} skipped`);
        }

        progress.totalProcessed += batchDocs.length;

        // Save progress every batch
        saveProgress(progress);

        // Reset counters for next batch
        batchUpdated = 0;
        batchSkipped = 0;
      }

      // Update last processed document
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      progress.lastProcessedDoc = lastDoc.id;

      // Log progress
      console.log(`\nProgress: ${progress.totalProcessed} processed, ${progress.totalUpdated} updated, ${progress.totalSkipped} skipped`);
      console.log(`Last doc ID: ${lastDoc.id}\n`);

      // Check if we got fewer documents than the limit (means we're at the end)
      if (snapshot.docs.length < QUERY_LIMIT) {
        console.log(`Fetched ${snapshot.docs.length} < ${QUERY_LIMIT} - reached end of collection`);
        hasMore = false;
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error('Error processing batch:', error);
      progress.errors++;
      saveProgress(progress);

      // Wait before retrying
      console.log('Waiting 5 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Final summary
  console.log('\n=== Migration Complete ===');
  console.log(`Total processed: ${progress.totalProcessed}`);
  console.log(`Total updated: ${progress.totalUpdated}`);
  console.log(`Total skipped: ${progress.totalSkipped}`);
  console.log(`Errors: ${progress.errors}`);
  console.log(`Started: ${progress.startTime}`);
  console.log(`Completed: ${new Date().toISOString()}`);

  const duration = new Date().getTime() - new Date(progress.startTime).getTime();
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  console.log(`Duration: ${minutes}m ${seconds}s`);

  saveProgress(progress);
}

// Run migration
migrateDocuments()
  .then(() => {
    console.log('\nMigration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
