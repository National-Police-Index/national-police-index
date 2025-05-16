import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collectionGroup,
  query,
  getDocs,
  writeBatch,
  doc,
  collection,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  CollectionReference,
  Query,
  setDoc,
  where
} from 'firebase/firestore';

// Configure chunk sizes for memory management
const BATCH_SIZE = 20; // Number of writes per batch
const QUERY_LIMIT = 100; // Number of documents per query
const MAX_PAGES_PER_AGENCY = 20000; // Safety limit for pagination
const GC_INTERVAL = 1; // Run garbage collection every page

// Collection names
const TEMP_COLLECTION = 'temp_agency_discovery'; // Temporary collection for discovered agencies
const STATS_COLLECTION = 'statistics_per_agency'; // Final stats collection

// Load environment variables
import dotenv from 'dotenv';
import { US_STATES } from '@/constants/states';
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

interface AgencyStats {
  name: string;
  description: string;
  stats: StatItem[];
  state: string;
  last_updated: Date;
  is_partial?: boolean;
  pages_processed?: number;
  total_officers?: number;
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

async function loadDiscoveredAgencies(): Promise<Map<string, { name: string; state: string }>> {
  console.log('Loading previously discovered agencies...');
  const tempCollection = collection(db, TEMP_COLLECTION);
  const snapshot = await getDocs(tempCollection);
  const agencies = new Map<string, { name: string; state: string }>();

  snapshot.forEach(doc => {
    const data = doc.data();
    agencies.set(data.name, { name: data.name, state: data.state });
  });

  console.log(`Loaded ${agencies.size} previously discovered agencies`);
  return agencies;
}

async function saveDiscoveredAgency(agencyName: string, state: string) {
  const tempCollection = collection(db, TEMP_COLLECTION);
  const agencyDoc = doc(tempCollection, agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  await setDoc(agencyDoc, { name: agencyName, state, discovered_at: new Date() });
}

async function generateAgencyStats(state: string) {
  console.log('Starting agency statistics generation...');
  const statsCollection = collection(db, STATS_COLLECTION);
  const officersRef = collectionGroup(db, 'db_launch');

  // Load any previously discovered agencies
  const uniqueAgencies = await loadDiscoveredAgencies();

  // Get unique agencies with pagination
  let lastAgencyDoc: QueryDocumentSnapshot | null = null;
  let hasMoreAgencies = true;
  let agencyPageCount = 0;

  console.log('Discovering unique agencies...');
  while (hasMoreAgencies && agencyPageCount < MAX_PAGES_PER_AGENCY) {
    agencyPageCount++;
    let agencyQuery = query(officersRef, limit(QUERY_LIMIT));

    if (lastAgencyDoc) {
      agencyQuery = query(agencyQuery, startAfter(lastAgencyDoc));
    }

    agencyQuery = query(agencyQuery, where('state', '==', state));

    try {
      const agencySnapshot = await withTimeout(getDocs(agencyQuery), 30000); // 60 second timeout for initial query
      const docsSize = agencySnapshot.size;

      for (const doc of agencySnapshot.docs) {
        const data = doc.data();
        const agencyName = data.agency_name;
        const state = data.state;
        if (agencyName && state && !uniqueAgencies.has(agencyName)) {
          uniqueAgencies.set(agencyName, { name: agencyName, state });
          // Save each new agency as we discover it
          try {
            await saveDiscoveredAgency(agencyName, state);
          } catch (error) {
            console.error(`Failed to save discovered agency ${agencyName}:`, error);
          }
        }
      }

      if (agencySnapshot.docs.length > 0) {
        lastAgencyDoc = agencySnapshot.docs[agencySnapshot.docs.length - 1];
      }

      hasMoreAgencies = docsSize === QUERY_LIMIT;

      console.log(`Discovered ${uniqueAgencies.size} unique agencies so far... (page ${agencyPageCount})`);

      // Run garbage collection if needed
      if (agencyPageCount % GC_INTERVAL === 0 && typeof global.gc === 'function') {
        global.gc();
      }

    } catch (error) {
      console.error(`Error on agency discovery page ${agencyPageCount}:`, error);
      // Continue to next page even if this one failed
      hasMoreAgencies = false;
    }
  }

  console.log(`Found ${uniqueAgencies.size} unique agencies`);

  let batch = writeBatch(db);
  let batchCount = 0;

  // Process each agency
  for (const [agencyName, agencyInfo] of uniqueAgencies.entries()) {
    console.log(`Processing agency: ${agencyName}`);
    const agencyId = agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
      let lastDoc: QueryDocumentSnapshot | null = null;
      let totalProcessed = 0;
      const uniqueOfficers = new Set<string>();
      let hasMoreDocs = true;
      let pageCount = 0;

      // Query all officers for this agency with pagination
      while (hasMoreDocs && pageCount < MAX_PAGES_PER_AGENCY) {
        pageCount++;
        let q = query(
          officersRef,
          where('agency_name', '==', agencyName),
          limit(QUERY_LIMIT)
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const snapshot = await withTimeout(getDocs(q));
        const docsSize = snapshot.size;
        totalProcessed += docsSize;

        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.agency_name === agencyName) {
            uniqueOfficers.add(data.person_nbr);
          }
        });

        if (snapshot.docs.length > 0) {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }

        hasMoreDocs = docsSize === QUERY_LIMIT;

        // Run garbage collection if needed
        if (pageCount % GC_INTERVAL === 0 && typeof global.gc === 'function') {
          global.gc();
        }
      }

      // Create agency stats document
      const agencyStats: AgencyStats = {
        name: agencyName,
        description: `Police officer records and history in ${agencyName}`,
        stats: [{
          label: 'Total Officers',
          value: uniqueOfficers.size.toString()
        }],
        state: agencyInfo.state,
        last_updated: new Date(),
        total_officers: uniqueOfficers.size,
        pages_processed: pageCount
      };

      const statsDoc = doc(statsCollection, agencyId);
      batch.set(statsDoc, agencyStats);
      batchCount++;

      console.log(`Processed ${uniqueOfficers.size} officers for ${agencyName}`);

      // Commit batch if it's full
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} agencies`);
        batch = writeBatch(db);
        batchCount = 0;
      }

    } catch (error) {
      console.error(`Error processing agency ${agencyName}:`, error);
      // Store partial results if we have any
      const partialStats: AgencyStats = {
        name: agencyName,
        description: `Partial police officer records and history in ${agencyName}`,
        stats: [],
        state: agencyInfo.state,
        last_updated: new Date(),
        is_partial: true
      };

      const statsDoc = doc(statsCollection, agencyId);
      batch.set(statsDoc, partialStats);
      batchCount++;
    }
  }

  // Commit any remaining items in the batch
  if (batchCount > 0) {
    try {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} agencies`);
    } catch (error) {
      console.error('Error committing final batch:', error);
      throw error;
    }
  }
}

// Function to be called monthly
export async function updateAgencyStatistics() {
  try {
    await Promise.all(US_STATES.filter(item => item.hasData).map(async (item) => {
      console.log(`Generating agency statistics for ${item.reference}...`);
      await generateAgencyStats(item.reference);
    }));
    console.log('Agency statistics update completed successfully');

    // Clean up temporary collection after successful run
    /*
    console.log('Cleaning up temporary collection...');
    const tempCollection = collection(db, TEMP_COLLECTION);
    const snapshot = await getDocs(tempCollection);
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`Deleted ${batchCount} temporary documents`);
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`Deleted final ${batchCount} temporary documents`);
    }

    console.log('Temporary collection cleanup completed');
    */
  } catch (error) {
    console.error('Error updating agency statistics:', error);
    throw error;
  }
}

// Allow running directly from command line
updateAgencyStatistics()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });