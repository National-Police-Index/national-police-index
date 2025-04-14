import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch, doc, QueryDocumentSnapshot, limit, startAfter, orderBy, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { US_STATES } from '../constants/states';

// Configure chunk sizes for memory management
const BATCH_SIZE = 50; // Number of writes per batch
const QUERY_LIMIT = 250; // Number of documents per query
const STATE_CHUNK_SIZE = 2; // Number of states to process at once
const MAX_PAGES_PER_STATE = 400; // Safety limit for pagination to avoid infinite loops
const GC_INTERVAL = 2; // Run garbage collection every N pages

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

interface StateStats {
  title: string;
  description: string;
  total_officers: number;
  total_officer_end_date: { [year: string]: number };
  total_officer_start_date: { [year: string]: number };
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

async function processStateChunk(states: typeof US_STATES, statsCollection: ReturnType<typeof collection>) {
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
    const endDateStats: { [year: string]: number } = {};
    const startDateStats: { [year: string]: number } = {};
    let totalOfficers = 0;

    try {
      let hasMoreDocs = true;
      let pageCount = 0;
      let lastDoc = null;

      while (hasMoreDocs && pageCount < MAX_PAGES_PER_STATE) {
        pageCount++;
        // Build query with pagination
        let q = query(
          officersRef,
          where('state', '==', stateRef),
          orderBy('__name__'), // Use document ID for consistent pagination
          limit(QUERY_LIMIT)
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        console.log(`Querying officers for ${state.name} (attempt ${retryCount + 1})...`);
        const snapshot = await withTimeout(getDocs(q));
        console.log(`Retrieved ${snapshot.size} officers for ${state.name}`);
        totalOfficers += snapshot.size;

        if (snapshot.empty || snapshot.size < QUERY_LIMIT) {
          hasMoreDocs = false;
        } else {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }

        // Log progress
        console.log(`Page ${pageCount}/${MAX_PAGES_PER_STATE} for ${state.name}: ${totalOfficers} officers so far`);

        // Run garbage collection periodically
        if (pageCount % GC_INTERVAL === 0 && global.gc) {
          console.log('Running garbage collection...');
          global.gc();
          // Add a small delay to allow GC to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Process documents
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
          const data = doc.data();

          // Process end dates
          if (data.end_date) {
            const endYear = new Date(data.end_date).getFullYear().toString();
            endDateStats[endYear] = (endDateStats[endYear] || 0) + 1;
          }

          // Process start dates
          if (data.start_date) {
            const startYear = new Date(data.start_date).getFullYear().toString();
            startDateStats[startYear] = (startDateStats[startYear] || 0) + 1;
          }
        });

        // Force garbage collection between chunks
        if (global.gc) {
          global.gc();
        }
      }

      const stateStats: StateStats = {
        title: state.name,
        description: `Police officer records and history in ${state.name}`,
        total_officers: totalOfficers,
        total_officer_end_date: endDateStats,
        total_officer_start_date: startDateStats,
        last_updated: new Date()
      };

      // Add to batch
      const statsDoc = doc(statsCollection, stateRef);
      batch.set(statsDoc, stateStats);
      batchCount++;

      // Reset retry count for next state
      retryCount = 0;

      // Commit batch if it reaches the size limit or if we've processed a lot of records
      if (batchCount === BATCH_SIZE || totalOfficers % (BATCH_SIZE * QUERY_LIMIT) === 0) {
        await batch.commit();
        console.log(`Committed batch for ${batchCount} states`);
        batch = writeBatch(db); // Create a new batch
        batchCount = 0;
      }

      console.log(`Successfully processed ${totalOfficers} officers for ${state.name}`);
    } catch (error) {
      console.error(`Error processing state ${state.name}:`, error);

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying ${state.name} (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 5000 * retryCount)); // Exponential backoff
        continue;
      }

      // If all retries failed, store partial results if we have any
      if (totalOfficers > 0) {
        console.log(`Storing partial results for ${state.name} with ${totalOfficers} officers`);
        const stateStats: StateStats = {
          title: state.name,
          description: `Partial police officer records and history in ${state.name}`,
          total_officers: totalOfficers,
          total_officer_end_date: endDateStats,
          total_officer_start_date: startDateStats,
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
        } catch (writeError) {
          console.error(`Error storing partial results for ${state.name}:`, writeError);
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
      console.error('Error committing batch:', error);
      throw error;
    }
  }
}

async function generateStateStats() {
  console.log('Starting state statistics generation...');
  const statsCollection = collection(db, 'state_statistics');

  // Process states in chunks
  for (let i = 0; i < US_STATES.length; i += STATE_CHUNK_SIZE) {
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
export async function updateStateStatistics() {
  try {
    await generateStateStats();
    console.log('State statistics update completed successfully');
  } catch (error) {
    console.error('Error updating state statistics:', error);
    throw error;
  }
}

// Allow running directly from command line
if (require.main === module) {
  updateStateStatistics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
