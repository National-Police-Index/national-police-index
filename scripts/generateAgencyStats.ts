// Uses the Firebase ADMIN SDK, not the client SDK. The client SDK only has the
// public web config, so its writes to statistics_per_agency are governed by the
// deployed Firestore rules and fail with PERMISSION_DENIED. The admin SDK
// authenticates with the service account and bypasses rules, which is what a
// maintenance script needs. Same pattern as generateSitemap.ts.
import * as admin from 'firebase-admin';
import { loadServiceAccount } from '../utils/loadServiceAccount';

type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;


const BATCH_SIZE = 20;
const QUERY_LIMIT = 100;
const MAX_PAGES_PER_AGENCY = 20000;
const GC_INTERVAL = 1;


const TEMP_COLLECTION = 'temp_agency_discovery';
const STATS_COLLECTION = 'statistics_per_agency';


import { US_STATES } from '@/constants/states';

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

// Agency names are not unique across states (e.g. "Springfield Police
// Department"), so the in-memory map and the discovery cache are keyed by
// state + name rather than name alone.
function agencyKey(state: string, agencyName: string): string {
  return `${state}|${agencyName}`;
}

async function loadDiscoveredAgencies(): Promise<Map<string, { name: string; state: string }>> {
  const tempCollection = db.collection(TEMP_COLLECTION);
  const q = tempCollection.orderBy('discovered_at', 'desc');

  const snapshot = await q.get();
  const agencies = new Map<string, { name: string; state: string }>();

  snapshot.forEach(doc => {
    const data = doc.data();
    agencies.set(agencyKey(data.state, data.name), { name: data.name, state: data.state });
  });

  return agencies;
}

async function saveDiscoveredAgency(agencyName: string, state: string) {
  const tempCollection = db.collection(TEMP_COLLECTION);
  const agencyDoc = tempCollection.doc(
    `${state}-${agencyName}`.toLowerCase().replace(/[^a-z0-9]/g, '-')
  );
  await agencyDoc.set({ name: agencyName, state, discovered_at: new Date() });
}

async function generateAgencyStats(state: string) {
  const statsCollection = db.collection(STATS_COLLECTION);
  const officersRef = db.collectionGroup('db_launch');


  const uniqueAgencies = await loadDiscoveredAgencies();
  const inScope = [...uniqueAgencies.values()].filter(a => a.state === state).length;
  console.log(
    `loaded ${uniqueAgencies.size} cached agencies; ${inScope} are in ${state}`
  );


  let lastAgencyDoc: QueryDocumentSnapshot | null = null;
  let hasMoreAgencies = true;
  let agencyPageCount = 0;

  while (hasMoreAgencies && agencyPageCount < MAX_PAGES_PER_AGENCY) {
    agencyPageCount++;
    // where() must come BEFORE the cursor: the admin SDK rejects a where()
    // filter applied after startAfter()/startAt()/endBefore()/endAt(), whereas
    // the client SDK's query(q, where(...)) composition tolerated either order.
    let agencyQuery: admin.firestore.Query = officersRef
      .where('state', '==', state)
      .limit(QUERY_LIMIT);

    if (lastAgencyDoc) {
      agencyQuery = agencyQuery.startAfter(lastAgencyDoc);
    }

    try {
      const agencySnapshot = await withTimeout(agencyQuery.get(), 30000);
      const docsSize = agencySnapshot.size;

      for (const doc of agencySnapshot.docs) {
        const data = doc.data();
        const agencyName = data.agency_name;
        const state = data.state;
        if (agencyName && state && !uniqueAgencies.has(agencyKey(state, agencyName))) {
          uniqueAgencies.set(agencyKey(state, agencyName), { name: agencyName, state });

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


      if (agencyPageCount % GC_INTERVAL === 0 && typeof global.gc === 'function') {
        global.gc();
      }

    } catch (error) {
      console.error(`Error on agency discovery page ${agencyPageCount}:`, error);

      hasMoreAgencies = false;
    }
  }

  let batch = db.batch();
  let batchCount = 0;


  for (const agencyInfo of uniqueAgencies.values()) {
    const agencyName = agencyInfo.name;
    // temp_agency_discovery is a shared, cross-state cache and
    // loadDiscoveredAgencies() reads all of it, so without this guard passing
    // a state still recomputes agency stats for every other state's agencies
    // too (~5,100 agencies rather than this state's ~1,000). The state
    // argument is supposed to scope the whole run.
    if (agencyInfo.state !== state) {
      continue;
    }

    const agencyId = agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    try {
      let lastDoc: QueryDocumentSnapshot | null = null;
      const uniqueOfficers = new Set<string>();
      let hasMoreDocs = true;
      let pageCount = 0;


      while (hasMoreDocs && pageCount < MAX_PAGES_PER_AGENCY) {
        pageCount++;
        let q: admin.firestore.Query = officersRef
          .where('agency_name', '==', agencyName)
          .limit(QUERY_LIMIT);

        if (lastDoc) {
          q = q.startAfter(lastDoc);
        }

        const snapshot = await withTimeout(q.get());
        const docsSize = snapshot.size;

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


        if (pageCount % GC_INTERVAL === 0 && typeof global.gc === 'function') {
          global.gc();
        }
      }


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

      const statsDoc = statsCollection.doc(agencyId);
      batch.set(statsDoc, agencyStats);
      batchCount++;


      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
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
        is_partial: true
      };

      const statsDoc = statsCollection.doc(agencyId);
      batch.set(statsDoc, partialStats);
      batchCount++;
    }
  }


  if (batchCount > 0) {
    try {
      await batch.commit();
    } catch (error) {
      console.error('Error committing final batch:', error);
      throw error;
    }
  }
}


export async function updateAgencyStatistics(stateReference?: string) {
  try {
    // If a specific state is provided, only process that state
    const statesToProcess = stateReference 
      ? US_STATES.filter(item => item.hasData && item.reference === stateReference)
      : US_STATES.filter(item => item.hasData);

    if (statesToProcess.length === 0) {
      if (stateReference) {
        console.error(`State "${stateReference}" not found or has no data`);
        throw new Error(`Invalid state reference: ${stateReference}`);
      } else {
        console.log('No states with data found');
        return;
      }
    }

    console.log(`Processing ${statesToProcess.length} state(s): ${statesToProcess.map(s => s.name).join(', ')}`);

    await Promise.all(statesToProcess.map(async (item) => {
      console.log(`Generating stats for ${item.name}...`);
      await generateAgencyStats(item.reference);
    }));

    console.log('Agency statistics update completed successfully');
  } catch (error) {
    console.error('Error updating agency statistics:', error);
    throw error;
  }
}


const stateArg = process.argv[2];
(async () => {
  db = await initializeFirebase();
  return updateAgencyStatistics(stateArg);
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });