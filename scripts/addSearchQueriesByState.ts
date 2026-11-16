
// Uses the Firebase ADMIN SDK, not the client SDK. The client SDK only has the
// public web config, so its writes to db_launch are governed by the deployed
// Firestore rules and fail with PERMISSION_DENIED. The admin SDK authenticates
// with the service account and bypasses rules, which is what a maintenance
// script needs. Same pattern as generateSitemap.ts / generate-stats.ts.
import * as admin from 'firebase-admin';
import fs from 'fs';
import { loadServiceAccount } from '../utils/loadServiceAccount';
import { searchTokens } from '../lib/officerSearch';

type DocumentData = admin.firestore.DocumentData;
type QueryDocumentSnapshot<T = DocumentData> =
  admin.firestore.QueryDocumentSnapshot<T>;

let db: admin.firestore.Firestore;
/** Set when a state fails or is rejected; the process then exits 1. */
let failed = false;

async function initializeFirebase(): Promise<admin.firestore.Firestore> {
  if (!admin.apps.length) {
    const serviceAccount = await loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin.firestore();
}

interface OfficerDocument extends DocumentData {
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  searchQueries?: string[];
  state?: string;
}


const US_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire',
  'new-jersey', 'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west-virginia',
  'wisconsin', 'wyoming'
];


const CONFIG = {
  batchSize: 500,
  queryLimit: 1000,
  dryRun: false,
  logFrequency: 100,
  // Inside the repo (git-ignored by *_progress.json).
  logFile: './search_queries_progress.json',
  specificState: process.argv[2] || null,
};


interface StateProgress {
  state: string;
  completed: boolean;
  documentsProcessed: number;
  documentsUpdated: number;
  documentsSkipped: number;
  lastProcessedAt: string;
}

interface ProgressData {
  states: StateProgress[];
  startedAt: string;
  lastUpdatedAt: string;
}


function loadProgressData(): ProgressData {
  try {
    if (fs.existsSync(CONFIG.logFile)) {
      const data = fs.readFileSync(CONFIG.logFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress data:', error);
  }


  return {
    states: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  };
}


function saveProgressData(progressData: ProgressData): void {
  try {
    progressData.lastUpdatedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(progressData, null, 2));
  } catch (error) {
    console.error('Error saving progress data:', error);
  }
}


async function processState(state: string, progressData: ProgressData): Promise<StateProgress> {

  // A state named on the command line always runs fresh: the writes are
  // idempotent, and a cursor is never saved, so the only thing a "completed"
  // entry could do is make a re-upload silently skip. Only the all-states
  // run (no argument) skips states it already finished, to resume.
  const existingProgress = progressData.states.find(s => s.state === state);
  if (!CONFIG.specificState && existingProgress && existingProgress.completed) {
    return existingProgress;
  }


  const stateProgress: StateProgress = {
    state,
    completed: false,
    documentsProcessed: 0,
    documentsUpdated: 0,
    documentsSkipped: 0,
    lastProcessedAt: new Date().toISOString()
  };

  try {
    let processed = stateProgress.documentsProcessed;
    let updatedCount = stateProgress.documentsUpdated;
    let skippedCount = stateProgress.documentsSkipped;
    let lastDoc: QueryDocumentSnapshot<OfficerDocument> | null = null;


    let hasMoreDocs = true;

    while (hasMoreDocs) {

      let dbQuery: admin.firestore.Query = db
        .collectionGroup('db_launch')
        .where('state', '==', state);

      if (lastDoc) {
        dbQuery = dbQuery.startAfter(lastDoc).limit(CONFIG.queryLimit);
      } else {
        dbQuery = dbQuery.limit(CONFIG.queryLimit);
      }

      const querySnapshot = await dbQuery.get();
      const batchSize = querySnapshot.docs.length;

      if (batchSize === 0) {
        hasMoreDocs = false;
        continue;
      }

      let batch = db.batch();
      let batchCount = 0;

      for (const docSnapshot of querySnapshot.docs as QueryDocumentSnapshot<OfficerDocument>[]) {
        const docData = docSnapshot.data();
        processed++;


        if (!docData.full_name && !docData.first_name && !docData.last_name) {
          skippedCount++;
          continue;
        }

        // Tokens come from the search module's own tokenizer, so what is
        // stored here is exactly what the client matcher expects: first,
        // middle and last name plus full_name, split on spaces and commas,
        // with punctuation-free forms and hyphen parts.
        const searchQueries = searchTokens(docData);

        const uniqueSearchQueries = [...new Set(searchQueries)];


        const docRef = docSnapshot.ref;


        if (!CONFIG.dryRun) {
          batch.update(docRef, { searchQueries: uniqueSearchQueries });
        }

        batchCount++;
        updatedCount++;


        if (processed % CONFIG.logFrequency === 0) {


          stateProgress.documentsProcessed = processed;
          stateProgress.documentsUpdated = updatedCount;
          stateProgress.documentsSkipped = skippedCount;
          stateProgress.lastProcessedAt = new Date().toISOString();


          const stateIndex = progressData.states.findIndex(s => s.state === state);
          if (stateIndex >= 0) {
            progressData.states[stateIndex] = stateProgress;
          } else {
            progressData.states.push(stateProgress);
          }

          saveProgressData(progressData);
        }


        if (batchCount >= CONFIG.batchSize && !CONFIG.dryRun) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
        }
      }


      if (batchCount > 0 && !CONFIG.dryRun) {
        await batch.commit();
      }


      lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] as QueryDocumentSnapshot<OfficerDocument>;


      if (querySnapshot.docs.length < CONFIG.queryLimit) {
        hasMoreDocs = false;
      }
    }


    stateProgress.completed = true;
    stateProgress.documentsProcessed = processed;
    stateProgress.documentsUpdated = updatedCount;
    stateProgress.documentsSkipped = skippedCount;
    stateProgress.lastProcessedAt = new Date().toISOString();

    console.log(`
    ========== STATE ${state.toUpperCase()} SUMMARY ==========
    Documents processed: ${processed}
    Documents updated: ${updatedCount}
    Documents skipped: ${skippedCount}
    Dry run mode: ${CONFIG.dryRun ? 'ON (no changes made)' : 'OFF (changes committed)'}
    =================================================
    `);

    return stateProgress;

  } catch (error) {
    console.error(`Error processing state ${state}:`, error);
    failed = true;
    return stateProgress;
  }
}


async function addSearchQueriesByState(): Promise<void> {
  try {

    const progressData = loadProgressData();


    let statesToProcess: string[] = [];

    if (CONFIG.specificState) {

      if (US_STATES.includes(CONFIG.specificState.toLowerCase())) {
        statesToProcess = [CONFIG.specificState.toLowerCase()];
      } else {
        console.error(`Invalid state specified: ${CONFIG.specificState}`);
        failed = true;
        return;
      }
    } else {

      statesToProcess = US_STATES;
    }


    for (const state of statesToProcess) {
      const stateProgress = await processState(state, progressData);


      const stateIndex = progressData.states.findIndex(s => s.state === state);
      if (stateIndex >= 0) {
        progressData.states[stateIndex] = stateProgress;
      } else {
        progressData.states.push(stateProgress);
      }

      saveProgressData(progressData);
    }


    const completedStates = progressData.states.filter(s => s.completed).length;
    const totalDocumentsProcessed = progressData.states.reduce((sum, s) => sum + s.documentsProcessed, 0);
    const totalDocumentsUpdated = progressData.states.reduce((sum, s) => sum + s.documentsUpdated, 0);
    const totalDocumentsSkipped = progressData.states.reduce((sum, s) => sum + s.documentsSkipped, 0);

    console.log(`
    ========== FINAL SUMMARY ==========
    States processed: ${completedStates}/${US_STATES.length}
    Total documents processed: ${totalDocumentsProcessed}
    Total documents updated: ${totalDocumentsUpdated}
    Total documents skipped: ${totalDocumentsSkipped}
    Dry run mode: ${CONFIG.dryRun ? 'ON (no changes made)' : 'OFF (changes committed)'}
    ====================================
    `);

  } catch (error) {
    console.error('Error in main process:', error);
    failed = true;
  }
}


(async () => {
  db = await initializeFirebase();
  await addSearchQueriesByState();
  // Non-zero when any state failed, so a pipeline running steps in sequence stops here.
  console.log(failed ? 'Script finished with errors' : 'Script completed successfully');
  process.exit(failed ? 1 : 0);
})().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
