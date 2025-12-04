import { initializeApp } from "firebase/app";
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  type QueryDocumentSnapshot,
  query,
  setDoc,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";

const BATCH_SIZE = 20;
const QUERY_LIMIT = 100;
const MAX_PAGES_PER_AGENCY = 20000;
const GC_INTERVAL = 1;

const TEMP_COLLECTION = "temp_agency_discovery";
const STATS_COLLECTION = "statistics_per_agency";

import dotenv from "dotenv";
import { US_STATES } from "@/constants/states";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

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

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
): Promise<T> {
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

async function loadDiscoveredAgencies(): Promise<
  Map<string, { name: string; state: string }>
> {
  const tempCollection = collection(db, TEMP_COLLECTION);
  const q = query(tempCollection, orderBy("discovered_at", "desc"));

  const snapshot = await getDocs(q);
  const agencies = new Map<string, { name: string; state: string }>();

  snapshot.forEach((doc) => {
    const data = doc.data();
    agencies.set(data.name, { name: data.name, state: data.state });
  });

  return agencies;
}

async function saveDiscoveredAgency(agencyName: string, state: string) {
  const tempCollection = collection(db, TEMP_COLLECTION);
  const agencyDoc = doc(
    tempCollection,
    agencyName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
  );
  await setDoc(agencyDoc, {
    name: agencyName,
    state,
    discovered_at: new Date(),
  });
}

async function generateAgencyStats(state: string) {
  const statsCollection = collection(db, STATS_COLLECTION);
  const officersRef = collectionGroup(db, "db_launch");

  const uniqueAgencies = await loadDiscoveredAgencies();

  let lastAgencyDoc: QueryDocumentSnapshot | null = null;
  let hasMoreAgencies = true;
  let agencyPageCount = 0;

  while (hasMoreAgencies && agencyPageCount < MAX_PAGES_PER_AGENCY) {
    agencyPageCount++;
    let agencyQuery = query(officersRef, limit(QUERY_LIMIT));

    if (lastAgencyDoc) {
      agencyQuery = query(agencyQuery, startAfter(lastAgencyDoc));
    }

    agencyQuery = query(agencyQuery, where("state", "==", state));

    try {
      const agencySnapshot = await withTimeout(getDocs(agencyQuery), 30000);
      const docsSize = agencySnapshot.size;

      for (const doc of agencySnapshot.docs) {
        const data = doc.data();
        const agencyName = data.agency_name;
        const state = data.state;
        if (agencyName && state && !uniqueAgencies.has(agencyName)) {
          uniqueAgencies.set(agencyName, { name: agencyName, state });

          try {
            await saveDiscoveredAgency(agencyName, state);
          } catch (error) {
            console.error(
              `Failed to save discovered agency ${agencyName}:`,
              error,
            );
          }
        }
      }

      if (agencySnapshot.docs.length > 0) {
        lastAgencyDoc = agencySnapshot.docs[agencySnapshot.docs.length - 1];
      }

      hasMoreAgencies = docsSize === QUERY_LIMIT;

      if (
        agencyPageCount % GC_INTERVAL === 0 &&
        typeof global.gc === "function"
      ) {
        global.gc();
      }
    } catch (error) {
      console.error(
        `Error on agency discovery page ${agencyPageCount}:`,
        error,
      );

      hasMoreAgencies = false;
    }
  }

  let batch = writeBatch(db);
  let batchCount = 0;

  for (const [agencyName, agencyInfo] of uniqueAgencies.entries()) {
    const agencyId = agencyName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    try {
      let lastDoc: QueryDocumentSnapshot | null = null;
      let totalProcessed = 0;
      const uniqueOfficers = new Set<string>();
      let hasMoreDocs = true;
      let pageCount = 0;

      while (hasMoreDocs && pageCount < MAX_PAGES_PER_AGENCY) {
        pageCount++;
        let q = query(
          officersRef,
          where("agency_name", "==", agencyName),
          limit(QUERY_LIMIT),
        );

        if (lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const snapshot = await withTimeout(getDocs(q));
        const docsSize = snapshot.size;
        totalProcessed += docsSize;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.agency_name === agencyName) {
            uniqueOfficers.add(data.person_nbr);
          }
        });

        if (snapshot.docs.length > 0) {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }

        hasMoreDocs = docsSize === QUERY_LIMIT;

        if (pageCount % GC_INTERVAL === 0 && typeof global.gc === "function") {
          global.gc();
        }
      }

      const agencyStats: AgencyStats = {
        name: agencyName,
        description: `Police officer records and history in ${agencyName}`,
        stats: [
          {
            label: "Total Officers",
            value: uniqueOfficers.size.toString(),
          },
        ],
        state: agencyInfo.state,
        last_updated: new Date(),
        total_officers: uniqueOfficers.size,
        pages_processed: pageCount,
      };

      const statsDoc = doc(statsCollection, agencyId);
      batch.set(statsDoc, agencyStats);
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    } catch (error) {
      console.error(`Error processing agency ${agencyName}:`, error);

      const partialStats: AgencyStats = {
        name: agencyName,
        description: `Partial police officer records and history in ${agencyName}`,
        stats: [],
        state: agencyInfo.state,
        last_updated: new Date(),
        is_partial: true,
      };

      const statsDoc = doc(statsCollection, agencyId);
      batch.set(statsDoc, partialStats);
      batchCount++;
    }
  }

  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error committing final batch:", error);
      throw error;
    }
  }
}

export async function updateAgencyStatistics(stateReference?: string) {
  try {
    // If a specific state is provided, only process that state
    const statesToProcess = stateReference
      ? US_STATES.filter(
          (item) => item.hasData && item.reference === stateReference,
        )
      : US_STATES.filter((item) => item.hasData);

    if (statesToProcess.length === 0) {
      if (stateReference) {
        console.error(`State "${stateReference}" not found or has no data`);
        throw new Error(`Invalid state reference: ${stateReference}`);
      } else {
        console.log("No states with data found");
        return;
      }
    }

    console.log(
      `Processing ${statesToProcess.length} state(s): ${statesToProcess.map((s) => s.name).join(", ")}`,
    );

    await Promise.all(
      statesToProcess.map(async (item) => {
        console.log(`Generating stats for ${item.name}...`);
        await generateAgencyStats(item.reference);
      }),
    );

    console.log("Agency statistics update completed successfully");
  } catch (error) {
    console.error("Error updating agency statistics:", error);
    throw error;
  }
}

const stateArg = process.argv[2];
updateAgencyStatistics(stateArg)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
