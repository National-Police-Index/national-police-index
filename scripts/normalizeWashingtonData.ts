// Script to normalize state data by adding full_name field
// Usage: npx ts-node scripts/normalizeStateData.ts <state-name>
// Example: npx ts-node scripts/normalizeStateData.ts washington
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collectionGroup,
  getDocs,
  writeBatch,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
  limit,
  startAfter,
  query,
  where,
  orderBy
} from 'firebase/firestore';

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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
console.log(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get the state from command line arguments
const targetState = process.argv[2]?.toLowerCase();

if (!targetState) {
  console.error('Error: No state specified');
  console.log('Usage: npx ts-node scripts/normalizeStateData.ts <state-name>');
  console.log('Example: npx ts-node scripts/normalizeStateData.ts washington');
  process.exit(1);
}

// Configuration
const CONFIG = {
  batchSize: 500, // Number of documents to process in each batch
  maxRetries: 3,   // Maximum number of retries for failed operations
  progressFile: `./${targetState}_progress.json`, // File to track progress
  targetState: targetState, // The state we're targeting
};

// Types
interface OfficerDocument extends DocumentData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name?: string;
  person_nbr?: string;
  state?: string;
}

interface ProgressData {
  lastProcessedId: string | null;
  processedCount: number;
  skippedCount: number;
  totalDocuments: number;
  startTime: number;
  completed: boolean;
  state: string;
}

// Validate the state name
function validateState(state: string): boolean {
  // You could import your states.ts file here to validate against your official list
  // For now, we'll just do a basic validation
  if (!state || state.trim() === '') {
    console.error('Invalid state name');
    return false;
  }
  return true;
}



// Load progress data if it exists
function loadProgress(): ProgressData {
  try {
    if (fs.existsSync(CONFIG.progressFile)) {
      const data = fs.readFileSync(CONFIG.progressFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress file:', error);
  }

  // Default progress data
  return {
    lastProcessedId: null,
    processedCount: 0,
    skippedCount: 0,
    totalDocuments: 0,
    startTime: Date.now(),
    completed: false,
    state: CONFIG.targetState
  };
}

// Save progress data
function saveProgress(progress: ProgressData) {
  try {
    fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

// Main function to normalize state data
async function normalizeStateData() {
  // Validate the state
  if (!validateState(CONFIG.targetState)) {
    process.exit(1);
  }
  
  console.log(`Starting ${CONFIG.targetState} data normalization...`);

  // Load progress
  const progress = loadProgress();
  if (progress.completed) {
    console.log('Process already completed. Delete progress file to run again.');
    return;
  }

  let processed = progress.processedCount;
  let skippedCount = progress.skippedCount;
  let totalDocuments = progress.totalDocuments;
  let lastDocId = progress.lastProcessedId;
  const startTime = progress.startTime || Date.now();

  try {
    console.log(`Processing state: ${CONFIG.targetState}`);
    console.log(`Resuming from document ID: ${lastDocId || 'beginning'}`);

    let hasMoreDocs = true;
    let lastDocSnapshot: QueryDocumentSnapshot | null = null;
    
    while (hasMoreDocs) {
      // Build query for Washington state documents
      let q = query(
        collectionGroup(db, 'db_launch'),
        where('state', '==', CONFIG.targetState.toLowerCase()),
        limit(CONFIG.batchSize)
      );
      
      // If we have a last document snapshot, start after it
      if (lastDocSnapshot) {
        q = query(q, startAfter(lastDocSnapshot));
      } else if (lastDocId) {
        // If we only have the ID but not the snapshot (e.g., after script restart)
        try {
          // Try to find the document first
          const lastDocQuery = query(
            collectionGroup(db, 'db_launch'),
            where('state', '==', CONFIG.targetState.toLowerCase()),
            where('__name__', '==', lastDocId),
            limit(1)
          );
          
          const lastDocQuerySnapshot = await getDocs(lastDocQuery);
          
          if (!lastDocQuerySnapshot.empty) {
            q = query(q, startAfter(lastDocQuerySnapshot.docs[0]));
            lastDocSnapshot = lastDocQuerySnapshot.docs[0];
          } else {
            console.log(`Could not find last processed document with ID: ${lastDocId}. Starting from the beginning.`);
            lastDocId = null;
          }
        } catch (error) {
          console.error('Error finding last document:', error);
          lastDocId = null;
        }
      }

      // Execute query
      const querySnapshot = await getDocs(q);
      const batchSize = querySnapshot.size;
      
      if (batchSize === 0) {
        hasMoreDocs = false;
        continue;
      }

      totalDocuments += batchSize;
      console.log(`Processing batch of ${batchSize} documents...`);

      // Use batched writes for better performance
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const docData = docSnapshot.data();
        processed++;

        // Skip if already has full_name
        if (docData.full_name) {
          console.log(`Document ${docSnapshot.id} already has full_name field, skipping`);
          skippedCount++;
          continue;
        }

        // Create full_name from first_name, middle_name, and last_name in CAPITAL LETTERS
        let fullName = '';
        if (docData.first_name && docData.last_name) {
          const firstName = docData.first_name.toUpperCase();
          const middleName = docData.middle_name ? docData.middle_name.toUpperCase() : '';
          const lastName = docData.last_name.toUpperCase();
          
          fullName = middleName 
            ? `${firstName} ${middleName} ${lastName}`.trim()
            : `${firstName} ${lastName}`.trim();
        }

        // Skip if we couldn't determine a name
        if (!fullName) {
          console.log(`Skipping document ${docSnapshot.id} - no name fields`);
          skippedCount++;
          continue;
        }

        // Update the document with the full_name field
        batch.update(docSnapshot.ref, { full_name: fullName });
        batchCount++;

        // If we've reached the batch limit, commit and create a new batch
        if (batchCount >= 500) { // Firestore batch limit is 500
          console.log(`Committing batch of ${batchCount} updates...`);
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }

        // Update progress after each document
        lastDocId = docSnapshot.id;
        lastDocSnapshot = docSnapshot;

        // Save progress periodically
        if (processed % 100 === 0) {
          progress.lastProcessedId = lastDocId;
          progress.processedCount = processed;
          progress.skippedCount = skippedCount;
          progress.totalDocuments = totalDocuments;
          saveProgress(progress);

          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const docsPerSecond = processed / elapsedSeconds;
          console.log(`Progress: ${processed} documents processed (${docsPerSecond.toFixed(2)} docs/sec)`);
        }
      }

      // Commit any remaining updates
      if (batchCount > 0) {
        console.log(`Committing final batch of ${batchCount} updates...`);
        await batch.commit();
      }
    }

    // Mark as completed
    progress.completed = true;
    progress.lastProcessedId = lastDocId;
    progress.processedCount = processed;
    progress.skippedCount = skippedCount;
    progress.totalDocuments = totalDocuments;
    saveProgress(progress);

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    console.log(`
    ✅ Completed normalizing ${CONFIG.targetState} data
    📊 Statistics:
      - Total documents: ${totalDocuments}
      - Processed: ${processed}
      - Skipped: ${skippedCount}
      - Time elapsed: ${elapsedSeconds.toFixed(2)} seconds
      - Processing rate: ${(processed / elapsedSeconds).toFixed(2)} docs/sec
    `);

  } catch (error) {
    console.error('Error normalizing data:', error);

    // Save progress on error
    progress.lastProcessedId = lastDocId;
    progress.processedCount = processed;
    progress.skippedCount = skippedCount;
    progress.totalDocuments = totalDocuments;
    saveProgress(progress);

    throw error;
  }
}

// Run the script
normalizeStateData().catch(console.error);
