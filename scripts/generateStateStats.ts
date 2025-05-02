import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  QueryDocumentSnapshot,
  limit,
  startAfter,
  orderBy,
  DocumentData,
  CollectionReference,
  Query
} from 'firebase/firestore';
import { US_STATES } from '../constants/states.js';

interface State {
  name: string;
  abbreviation: string;
}

// Configure chunk sizes for memory management
const BATCH_SIZE = 20; // Number of writes per batch - reduced for memory
const QUERY_LIMIT = 100; // Number of documents per query - reduced for memory
const STATE_CHUNK_SIZE = 1; // Process one state at a time
const MAX_PAGES_PER_STATE = 20000; // Safety limit for pagination
const GC_INTERVAL = 1; // Run garbage collection every page

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface StatItem {
  label: string;
  value: string;
}

interface StateStats {
  title: string;
  description: string;
  stats: StatItem[];
  last_updated: Date;
  is_partial?: boolean;
  pages_processed?: number;
}

// Timeout wrapper for Firebase queries
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

async function processStateChunk(states: typeof US_STATES, statsCollection: CollectionReference) {
  let batch = writeBatch(db);
  let batchCount = 0;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  for (const state of states) {
    console.log(`Processing state: ${state.name}`);
    const stateRef = state.reference.toLowerCase();

    // Query officers for this state with pagination
    const officersRef = collection(db, 'db_launch');
    let lastDoc: QueryDocumentSnapshot | null = null;
    let totalProcessed = 0;
    // Use a Set to track unique document_ids (more memory efficient)
    const uniqueDocumentIds = new Set<string>();

    try {
      let hasMoreDocs: boolean = true;
      let pageCount: number = 0;

      while (hasMoreDocs && pageCount < MAX_PAGES_PER_STATE) {
        pageCount++;
        // Build query with pagination
        let q: Query = query(
          officersRef,
          where('state', '==', stateRef),
          limit(QUERY_LIMIT)
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        console.log(`Querying officers for ${state.name} (attempt ${retryCount + 1})...`);
        const snapshot = await withTimeout(getDocs(q));
        console.log(`Retrieved ${snapshot.size} officers for ${state.name}`);
        totalProcessed += snapshot.size;

        // Process each document and only store unique document_ids
        snapshot.forEach(doc => {
          const data = doc.data();
          const documentId = data.document_id;
          if (documentId) {
            uniqueDocumentIds.add(documentId);
          }
        });

        if (snapshot.empty || snapshot.size < QUERY_LIMIT) {
          hasMoreDocs = false;
        } else {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }

        // Log progress
        console.log(`Page ${pageCount}/${MAX_PAGES_PER_STATE} for ${state.name}: ${totalProcessed} processed, ${uniqueDocumentIds.size} unique officers so far`);

        // Run garbage collection if available
        if (pageCount % GC_INTERVAL === 0) {
          // Clear references and run GC
          snapshot.docs.length = 0;
          if (global.gc) {
            global.gc();
          }
          // Add a small delay to allow GC to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const stateStats: StateStats = {
        title: state.name,
        description: `Police officer records and history in ${state.name}`,
        stats: [
          {
            label: 'Total Officers',
            value: uniqueDocumentIds.size.toString()
          },
          {
            label: 'Total Records Processed',
            value: totalProcessed.toString()
          }
        ],
        last_updated: new Date()
      };

      // Add to batch
      const statsDoc = doc(statsCollection, stateRef);
      batch.set(statsDoc, stateStats);
      batchCount++;

      // Reset retry count for next state
      retryCount = 0;

      // Commit batch if it reaches the size limit
      if (batchCount === BATCH_SIZE) {
        await batch.commit();
        console.log(`Committed batch for ${batchCount} states`);
        batch = writeBatch(db); // Create a new batch
        batchCount = 0;
      }

      console.log(`Successfully processed ${totalProcessed} records (${uniqueDocumentIds.size} unique officers) for ${state.name}`);
    } catch (error: unknown) {
      console.error(`Error processing state ${state.name}:`, error instanceof Error ? error.message : 'Unknown error');

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying ${state.name} (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 5000 * retryCount)); // Exponential backoff
        continue;
      }

      // If all retries failed, store partial results if we have any
      if (uniqueDocumentIds.size > 0) {
        console.log(`Storing partial results for ${state.name} with ${uniqueDocumentIds.size} unique officers`);
        const stateStats: StateStats = {
          title: state.name,
          description: `Partial police officer records and history in ${state.name}`,
          stats: [
            {
              label: 'Total Officers',
              value: uniqueDocumentIds.size.toString()
            }
          ],
          last_updated: new Date(),
          is_partial: true
        };

        try {
          const statsDoc = doc(statsCollection, stateRef);
          batch.set(statsDoc, stateStats);
          batchCount++;

          // Force commit partial results immediately
          if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed partial results for ${state.name}`);
            batch = writeBatch(db); // Create a new batch
            batchCount = 0;
          }
        } catch (writeError: unknown) {
          console.error(`Error storing partial results for ${state.name}:`, writeError instanceof Error ? writeError.message : 'Unknown error');
        }
      }
    }
  }

  // Commit any remaining items in the batch
  if (batchCount > 0) {
    try {
      await batch.commit();
      console.log(`Committed final batch for ${batchCount} states`);
      batch = writeBatch(db); // Create a new batch for any subsequent operations
      batchCount = 0;
    } catch (error) {
      console.error('Error committing batch:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}

async function generateStateStats(startFromState?: string) {
  console.log('Starting state statistics generation...');
  const statsCollection = collection(db, 'statistics_per_state');
  
  // Find the starting index if a state is specified
  let startIndex = 0;
  if (startFromState) {
    startIndex = US_STATES.findIndex(state => state.name.toLowerCase() === startFromState.toLowerCase());
    if (startIndex === -1) {
      console.error(`State ${startFromState} not found. Starting from the beginning.`);
      startIndex = 0;
    } else {
      console.log(`Resuming from state: ${US_STATES[startIndex].name}`);
    }
  }

  // Process states in chunks
  for (let i = startIndex; i < US_STATES.length; i += STATE_CHUNK_SIZE) {
    const stateChunk = US_STATES.slice(i, i + STATE_CHUNK_SIZE);
    console.log(`Processing states ${i + 1} to ${Math.min(i + STATE_CHUNK_SIZE, US_STATES.length)}`);
    await processStateChunk(stateChunk, statsCollection);

    // Force garbage collection between chunks
    if (global.gc) {
      global.gc();
    }
  }

  console.log('Successfully updated state statistics');
}

// Function to be called monthly
export async function updateStateStatistics(startFromState?: string) {
  try {
    await generateStateStats(startFromState);
    console.log('State statistics update completed successfully');
  } catch (error) {
    console.error('Error updating state statistics:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Allow running directly from command line
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const startFromState = process.argv[2];
  updateStateStatistics(startFromState)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    });
}