import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import {
  collectionGroup,
  type DocumentData,
  doc,
  getDocs,
  getFirestore,
  limit,
  type QueryDocumentSnapshot,
  query,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface OfficerDocument extends DocumentData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  searchQueries?: string[];
  state?: string;
}

const US_STATES = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new-hampshire",
  "new-jersey",
  "new-mexico",
  "new-york",
  "north-carolina",
  "north-dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode-island",
  "south-carolina",
  "south-dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west-virginia",
  "wisconsin",
  "wyoming",
];

const CONFIG = {
  batchSize: 500,
  queryLimit: 1000,
  dryRun: false,
  includeFirstLast: false,
  logFrequency: 100,
  logFile: "../search_queries_progress.json",
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
      const data = fs.readFileSync(CONFIG.logFile, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading progress data:", error);
  }

  return {
    states: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

function saveProgressData(progressData: ProgressData): void {
  try {
    progressData.lastUpdatedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(progressData, null, 2));
  } catch (error) {
    console.error("Error saving progress data:", error);
  }
}

async function processState(
  state: string,
  progressData: ProgressData,
): Promise<StateProgress> {
  const existingProgress = progressData.states.find((s) => s.state === state);
  if (existingProgress && existingProgress.completed) {
    return existingProgress;
  }

  const stateProgress: StateProgress = existingProgress || {
    state,
    completed: false,
    documentsProcessed: 0,
    documentsUpdated: 0,
    documentsSkipped: 0,
    lastProcessedAt: new Date().toISOString(),
  };

  try {
    let processed = stateProgress.documentsProcessed;
    let updatedCount = stateProgress.documentsUpdated;
    let skippedCount = stateProgress.documentsSkipped;
    let totalDocuments = 0;
    let lastDoc: QueryDocumentSnapshot<OfficerDocument> | null = null;

    let hasMoreDocs = true;

    while (hasMoreDocs) {
      let dbQuery = collectionGroup(db, "db_launch");
      dbQuery = query(dbQuery, where("state", "==", state));

      if (lastDoc) {
        dbQuery = query(dbQuery, startAfter(lastDoc), limit(CONFIG.queryLimit));
      } else {
        dbQuery = query(dbQuery, limit(CONFIG.queryLimit));
      }

      const querySnapshot = await getDocs(dbQuery);
      const batchSize = querySnapshot.docs.length;

      if (batchSize === 0) {
        hasMoreDocs = false;
        continue;
      }

      totalDocuments += batchSize;

      let batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of querySnapshot.docs as QueryDocumentSnapshot<OfficerDocument>[]) {
        const docData = docSnapshot.data();
        processed++;

        let fullName = docData.full_name || "";
        if (!fullName && docData.first_name && docData.last_name) {
          fullName = `${docData.first_name} ${docData.last_name}`.trim();
        }

        if (!fullName) {
          skippedCount++;
          continue;
        }

        const searchQueries: string[] = [];

        fullName
          .trim()
          .split(/\s+/)
          .filter((term) => term.length > 0)
          .forEach((term) => searchQueries.push(term.toLowerCase()));

        if (CONFIG.includeFirstLast && docData.first_name) {
          searchQueries.push(docData.first_name.toLowerCase());
        }

        if (CONFIG.includeFirstLast && docData.last_name) {
          searchQueries.push(docData.last_name.toLowerCase());
        }

        const uniqueSearchQueries = [...new Set(searchQueries)];

        const docRef = doc(db, docSnapshot.ref.path);

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

          const stateIndex = progressData.states.findIndex(
            (s) => s.state === state,
          );
          if (stateIndex >= 0) {
            progressData.states[stateIndex] = stateProgress;
          } else {
            progressData.states.push(stateProgress);
          }

          saveProgressData(progressData);
        }

        if (batchCount >= CONFIG.batchSize && !CONFIG.dryRun) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      if (batchCount > 0 && !CONFIG.dryRun) {
        await batch.commit();
      }

      lastDoc = querySnapshot.docs[
        querySnapshot.docs.length - 1
      ] as QueryDocumentSnapshot<OfficerDocument>;

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
    Dry run mode: ${CONFIG.dryRun ? "ON (no changes made)" : "OFF (changes committed)"}
    =================================================
    `);

    return stateProgress;
  } catch (error) {
    console.error(`Error processing state ${state}:`, error);
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
        return;
      }
    } else {
      statesToProcess = US_STATES;
    }

    for (const state of statesToProcess) {
      const stateProgress = await processState(state, progressData);

      const stateIndex = progressData.states.findIndex(
        (s) => s.state === state,
      );
      if (stateIndex >= 0) {
        progressData.states[stateIndex] = stateProgress;
      } else {
        progressData.states.push(stateProgress);
      }

      saveProgressData(progressData);
    }

    const completedStates = progressData.states.filter(
      (s) => s.completed,
    ).length;
    const totalDocumentsProcessed = progressData.states.reduce(
      (sum, s) => sum + s.documentsProcessed,
      0,
    );
    const totalDocumentsUpdated = progressData.states.reduce(
      (sum, s) => sum + s.documentsUpdated,
      0,
    );
    const totalDocumentsSkipped = progressData.states.reduce(
      (sum, s) => sum + s.documentsSkipped,
      0,
    );

    console.log(`
    ========== FINAL SUMMARY ==========
    States processed: ${completedStates}/${US_STATES.length}
    Total documents processed: ${totalDocumentsProcessed}
    Total documents updated: ${totalDocumentsUpdated}
    Total documents skipped: ${totalDocumentsSkipped}
    Dry run mode: ${CONFIG.dryRun ? "ON (no changes made)" : "OFF (changes committed)"}
    ====================================
    `);
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

addSearchQueriesByState()
  .then(() => console.log("Script completed successfully"))
  .catch((error) => console.error("Script failed:", error));
