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
  type Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import fs from "fs";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mirrors the style used in scripts/addSearchQueriesByState.ts
const _US_STATES = US_STATES.filter(
  (item) => !["kansas", "arizona"].includes(item.reference),
)
  .filter((item) => item.hasData)
  .map((item) => item.reference);

const CONFIG = {
  batchSize: 500,
  queryLimit: 1000,
  dryRun: false,
  logFrequency: 200,
  logFile: "../normalize_dates_progress.json",
  specificState: process.argv[2] || null,
};

interface OfficerDoc extends DocumentData {
  state?: string;
  start_date?: any;
  end_date?: any;
  start_date_iso?: string;
  end_date_iso?: string;
}

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

function isFirestoreTimestamp(value: any): value is Timestamp {
  return (
    value &&
    typeof value.toDate === "function" &&
    typeof value.seconds === "number"
  );
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toISODateOnlyUTC(d: Date): string {
  // Convert to date-only ISO with Z at midnight UTC
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
}

function normalizeDate(input: any): string {
  try {
    if (input === null || input === undefined) return "";

    // Firestore Timestamp or has toDate
    if (isFirestoreTimestamp(input)) {
      const d = input.toDate();
      if (isNaN(d.getTime())) return "";
      return d.toISOString();
    }

    // JS Date
    if (input instanceof Date) {
      if (isNaN(input.getTime())) return "";
      return input.toISOString();
    }

    // Numeric epochs
    if (typeof input === "number") {
      const ms = input > 1e12 ? input : input * 1000; // seconds vs ms
      const d = new Date(ms);
      if (isNaN(d.getTime())) return "";
      return d.toISOString();
    }

    // Strings
    if (typeof input === "string") {
      const s = input.trim();
      if (!s) return "";

      // If already ISO-like and Date can parse
      const isoCandidate = new Date(s);
      if (!isNaN(isoCandidate.getTime())) {
        // If the string looks like YYYY-MM-DD (date-only), normalize to midnight Z
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const [y, m, d] = s.split("-").map(Number);
          return toISODateOnlyUTC(new Date(Date.UTC(y, m - 1, d)));
        }
        return isoCandidate.toISOString();
      }

      // Common US date formats: MM/DD/YYYY or M/D/YY
      const mdY = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (mdY) {
        const month = parseInt(mdY[1], 10);
        const day = parseInt(mdY[2], 10);
        let year = parseInt(mdY[3], 10);
        if (year < 100) year += year >= 70 ? 1900 : 2000; // naive 2-digit year handling
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return toISODateOnlyUTC(new Date(Date.UTC(year, month - 1, day)));
        }
      }

      // YYYY/MM/DD
      const yMd = s.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
      if (yMd) {
        const year = parseInt(yMd[1], 10);
        const month = parseInt(yMd[2], 10);
        const day = parseInt(yMd[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return toISODateOnlyUTC(new Date(Date.UTC(year, month - 1, day)));
        }
      }

      // Month name formats (let JS parse; if valid, ISO)
      const nameParsed = new Date(s.replace(/\s+/g, " "));
      if (!isNaN(nameParsed.getTime())) {
        return nameParsed.toISOString();
      }

      // Unrecognized
      return "";
    }

    // Fallback
    return "";
  } catch {
    return "";
  }
}

async function processState(
  state: string,
  progressData: ProgressData,
): Promise<StateProgress> {
  console.log("Processing", state);
  const existing = progressData.states.find((s) => s.state === state);
  if (existing && existing.completed) return existing;

  const stateProgress: StateProgress = existing || {
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
    let lastDoc: QueryDocumentSnapshot<OfficerDoc> | null = null;
    let hasMore = true;

    while (hasMore) {
      let dbQuery = collectionGroup(db, "db_launch");
      dbQuery = query(dbQuery, where("state", "==", state));
      dbQuery = lastDoc
        ? query(dbQuery, startAfter(lastDoc), limit(CONFIG.queryLimit))
        : query(dbQuery, limit(CONFIG.queryLimit));

      const snap = await getDocs(dbQuery);
      const batchSize = snap.docs.length;
      if (batchSize === 0) {
        hasMore = false;
        break;
      }

      let batch = writeBatch(db);
      let batchCount = 0;

      for (const d of snap.docs as QueryDocumentSnapshot<OfficerDoc>[]) {
        const data = d.data();
        processed++;

        const normalizedStart = normalizeDate(data.start_date);
        const normalizedEnd = normalizeDate(data.end_date);

        // Determine if update is needed
        const needsUpdate =
          normalizedStart !==
            (typeof data.start_date === "string" ? data.start_date : "") ||
          normalizedEnd !==
            (typeof data.end_date === "string" ? data.end_date : "") ||
          data.start_date_iso !== normalizedStart ||
          data.end_date_iso !== normalizedEnd;

        if (!needsUpdate) {
          skippedCount++;
        } else {
          const docRef = doc(db, d.ref.path);
          if (!CONFIG.dryRun) {
            batch.update(docRef, {
              // start_date: normalizedStart,
              // end_date: normalizedEnd,
              start_date_iso: normalizedStart,
              end_date_iso: normalizedEnd,
            });
          }
          batchCount++;
          updatedCount++;
        }

        if (processed % CONFIG.logFrequency === 0) {
          stateProgress.documentsProcessed = processed;
          stateProgress.documentsUpdated = updatedCount;
          stateProgress.documentsSkipped = skippedCount;
          stateProgress.lastProcessedAt = new Date().toISOString();
          const idx = progressData.states.findIndex((s) => s.state === state);
          if (idx >= 0) progressData.states[idx] = stateProgress;
          else progressData.states.push(stateProgress);
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

      lastDoc = snap.docs[
        snap.docs.length - 1
      ] as QueryDocumentSnapshot<OfficerDoc>;
      if (snap.docs.length < CONFIG.queryLimit) {
        hasMore = false;
      }
    }

    stateProgress.completed = true;
    stateProgress.documentsProcessed = processed;
    stateProgress.documentsUpdated = updatedCount;
    stateProgress.documentsSkipped = skippedCount;
    stateProgress.lastProcessedAt = new Date().toISOString();

    console.log(`\n========== STATE ${state.toUpperCase()} SUMMARY ==========`);
    console.log(`Documents processed: ${processed}`);
    console.log(`Documents updated: ${updatedCount}`);
    console.log(`Documents skipped: ${skippedCount}`);
    console.log(
      `Dry run mode: ${
        CONFIG.dryRun ? "ON (no changes made)" : "OFF (changes committed)"
      }`,
    );
    console.log("=================================================");

    return stateProgress;
  } catch (error) {
    console.error(`Error processing state ${state}:`, error);
    // Ensure we return a valid StateProgress object even on error
    stateProgress.lastProcessedAt = new Date().toISOString();
    return stateProgress;
  }
}

async function normalizeDatesByState(): Promise<void> {
  const progressData = loadProgressData();

  let statesToProcess: string[] = [];
  if (CONFIG.specificState) {
    if (_US_STATES.includes(CONFIG.specificState.toLowerCase())) {
      statesToProcess = [CONFIG.specificState.toLowerCase()];
    } else {
      console.error(`Invalid state specified: ${CONFIG.specificState}`);
      return;
    }
  } else {
    statesToProcess = _US_STATES;
  }

  for (const state of statesToProcess) {
    const sp = await processState(state, progressData);
    const idx = progressData.states.findIndex((s) => s.state === state);
    if (idx >= 0) progressData.states[idx] = sp;
    else progressData.states.push(sp);
    saveProgressData(progressData);
  }

  const completed = progressData.states.filter((s) => s.completed).length;
  const totalProcessed = progressData.states.reduce(
    (sum, s) => sum + s.documentsProcessed,
    0,
  );
  const totalUpdated = progressData.states.reduce(
    (sum, s) => sum + s.documentsUpdated,
    0,
  );
  const totalSkipped = progressData.states.reduce(
    (sum, s) => sum + s.documentsSkipped,
    0,
  );

  console.log(`\n========== FINAL SUMMARY ==========`);
  console.log(`States processed: ${completed}/${US_STATES.length}`);
  console.log(`Total documents processed: ${totalProcessed}`);
  console.log(`Total documents updated: ${totalUpdated}`);
  console.log(`Total documents skipped: ${totalSkipped}`);
  console.log(
    `Dry run mode: ${
      CONFIG.dryRun ? "ON (no changes made)" : "OFF (changes committed)"
    }`,
  );
  console.log(`====================================`);
}

normalizeDatesByState()
  .then(() => console.log("Script completed successfully"))
  .catch((err) => console.error("Script failed:", err));
