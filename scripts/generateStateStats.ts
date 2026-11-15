// Uses the Firebase ADMIN SDK, not the client SDK. The client SDK only has the
// public web config, so its writes to statistics_per_state are governed by the
// deployed Firestore rules and fail with PERMISSION_DENIED. The admin SDK
// authenticates with the service account and bypasses rules, which is what a
// maintenance script needs. Same pattern as generateSitemap.ts.
import * as admin from 'firebase-admin';
import { US_STATES } from '../constants/states.js';
import { loadServiceAccount } from '../utils/loadServiceAccount';

type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;
type CollectionReference = admin.firestore.CollectionReference;
type Query = admin.firestore.Query;


const BATCH_SIZE = 20;
const QUERY_LIMIT = 100;
const STATE_CHUNK_SIZE = 1;
const MAX_PAGES_PER_STATE = 20000;
const GC_INTERVAL = 1;


let db: admin.firestore.Firestore;

async function initializeFirebase(): Promise<admin.firestore.Firestore> {
  if (!admin.apps.length) {
    const serviceAccount = await loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.firestore();
}

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
  let batch = db.batch();
  let batchCount = 0;
  let retryCount = 0;
  const MAX_RETRIES = 3;

  for (const state of states) {
    const stateRef = state.reference.toLowerCase();


    const officersRef = db.collection('db_launch');
    let lastDoc: QueryDocumentSnapshot | null = null;
    let totalProcessed = 0;

    const uniqueDocumentIds = new Set<string>();

    try {
      let hasMoreDocs: boolean = true;
      let pageCount: number = 0;

      while (hasMoreDocs && pageCount < MAX_PAGES_PER_STATE) {
        pageCount++;

        let q: Query = officersRef
          .where('state', '==', stateRef)
          .limit(QUERY_LIMIT);

        if (lastDoc) {
          q = q.startAfter(lastDoc);
        }

        const snapshot = await withTimeout(q.get());
        totalProcessed += snapshot.size;


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

        if (pageCount % GC_INTERVAL === 0) {

          snapshot.docs.length = 0;
          if (global.gc) {
            global.gc();
          }

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


      const statsDoc = statsCollection.doc(stateRef);
      batch.set(statsDoc, stateStats);
      batchCount++;


      retryCount = 0;


      if (batchCount === BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }

    } catch (error: unknown) {
      console.error(`Error processing state ${state.name}:`, error instanceof Error ? error.message : 'Unknown error');


      if (retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 5000 * retryCount));
        continue;
      }


      if (uniqueDocumentIds.size > 0) {
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
          const statsDoc = statsCollection.doc(stateRef);
          batch.set(statsDoc, stateStats);
          batchCount++;


          if (batchCount > 0) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        } catch (writeError: unknown) {
          console.error(`Error storing partial results for ${state.name}:`, writeError instanceof Error ? writeError.message : 'Unknown error');
        }
      }
    }
  }


  if (batchCount > 0) {
    try {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    } catch (error) {
      console.error('Error committing batch:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}

async function generateStateStats(startFromState?: string) {
  const statsCollection = db.collection('statistics_per_state');


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


  for (let i = startIndex; i < startIndex + 1 /*&& i < US_STATES.length*/; i += STATE_CHUNK_SIZE) {
    const stateChunk = US_STATES.slice(i, i + STATE_CHUNK_SIZE);
    await processStateChunk(stateChunk, statsCollection);


    if (global.gc) {
      global.gc();
    }
  }
}


export async function updateStateStatistics(startFromState?: string) {
  try {
    // Initialize here (not only in the main-module block) so callers that
    // import this function, e.g. scripts/build-stats.js, get a ready db.
    db ??= await initializeFirebase();
    await generateStateStats(startFromState);
  } catch (error) {
    console.error('Error updating state statistics:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}


if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const startFromState = process.argv[2];
  (async () => {
    await updateStateStatistics(startFromState);
    process.exit(0);
  })().catch((error) => {
    console.error('Script failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  });
}
