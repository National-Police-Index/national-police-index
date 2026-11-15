

// Uses the Firebase ADMIN SDK, not the client SDK.
//
// This script writes to db_launch. The client SDK authenticates with the
// public web config only, so its writes are governed by the deployed Firestore
// security rules and fail with PERMISSION_DENIED. The admin SDK authenticates
// with the service account and bypasses rules, which is what a maintenance
// script needs — and it avoids having to open db_launch to public writes while
// the script runs. Same pattern as generateSitemap.ts / generate-stats.ts.

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { loadServiceAccount } from '../utils/loadServiceAccount';

type QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;

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


const targetState = process.argv[2]?.toLowerCase();
// --fresh: ignore an interrupted run's saved position and start over.
const forceFresh = process.argv.includes('--fresh');

if (!targetState) {
  console.error('Error: No state specified');
  console.log('Usage: npx ts-node scripts/normalizeStateData.ts <state-name>');
  console.log('Example: npx ts-node scripts/normalizeStateData.ts washington');
  process.exit(1);
}


const CONFIG = {
  batchSize: 500,
  maxRetries: 3,
  progressFile: `./${targetState}_progress.json`,
  targetState: targetState,
};


interface ProgressData {
  lastProcessedId: string | null;
  processedCount: number;
  skippedCount: number;
  totalDocuments: number;
  startTime: number;
  completed: boolean;
  state: string;
}


function validateState(state: string): boolean {


  if (!state || state.trim() === '') {
    console.error('Invalid state name');
    return false;
  }
  return true;
}


function loadProgress(): ProgressData {
  try {
    if (fs.existsSync(CONFIG.progressFile)) {
      const data = fs.readFileSync(CONFIG.progressFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress file:', error);
  }


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


function saveProgress(progress: ProgressData) {
  try {
    fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}


async function normalizeStateData() {

  if (!validateState(CONFIG.targetState)) {
    process.exit(1);
  }

  console.log(`Starting ${CONFIG.targetState} data normalization...`);


  // A finished run (or --fresh) starts over: re-running after a re-upload must
  // never silently do nothing. Only an interrupted run resumes.
  let progress = loadProgress();
  if (progress.completed || forceFresh) {
    progress = {
      lastProcessedId: null,
      processedCount: 0,
      skippedCount: 0,
      totalDocuments: 0,
      startTime: Date.now(),
      completed: false,
      state: CONFIG.targetState,
    };
  } else if (progress.lastProcessedId) {
    console.log(`Resuming an interrupted run after ${progress.lastProcessedId} (pass --fresh to start over).`);
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

      // collectionGroup, not db.collection('db_launch'): the composite index
      // backing (state + cursor) is COLLECTION_GROUP-scoped, and a
      // collection-scoped query would need a separate index that does not exist.
      let q: admin.firestore.Query = db
        .collectionGroup('db_launch')
        .where('state', '==', CONFIG.targetState.toLowerCase())
        .limit(CONFIG.batchSize);


      if (lastDocSnapshot) {
        q = q.startAfter(lastDocSnapshot);
      } else if (lastDocId) {

        try {

          // db_launch is a root collection, so the resume cursor can be fetched
          // by ID directly. The client-SDK version filtered on '__name__',
          // which in a collection-group query would require a full document
          // path rather than a bare ID.
          const lastDocRef = db.collection('db_launch').doc(lastDocId);
          const lastDocSnap = await lastDocRef.get();

          if (lastDocSnap.exists) {
            q = q.startAfter(lastDocSnap);
            lastDocSnapshot = lastDocSnap as QueryDocumentSnapshot;
          } else {
            console.log(`Could not find last processed document with ID: ${lastDocId}. Starting from the beginning.`);
            lastDocId = null;
          }
        } catch (error) {
          console.error('Error finding last document:', error);
          lastDocId = null;
        }
      }


      const querySnapshot = await q.get();
      const batchSize = querySnapshot.size;

      if (batchSize === 0) {
        hasMoreDocs = false;
        continue;
      }

      totalDocuments += batchSize;
      console.log(`Processing batch of ${batchSize} documents...`);


      const batch = db.batch();
      let batchCount = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const docData = docSnapshot.data();
        processed++;

        // Advance the cursor for every doc, including skipped ones; otherwise a
        // page where every doc is skipped would be refetched forever.
        lastDocId = docSnapshot.id;
        lastDocSnapshot = docSnapshot;


        if (docData.full_name) {
          console.log(`Document ${docSnapshot.id} already has full_name field, skipping`);
          skippedCount++;
          continue;
        }


        let fullName = '';
        if (!docData.full_name && docData.first_name && docData.last_name) {
          const firstName = docData.first_name.toUpperCase();
          const middleName = docData.middle_name ? docData.middle_name.toUpperCase() : '';
          const lastName = docData.last_name.toUpperCase();

          fullName = middleName
            ? `${firstName} ${middleName} ${lastName}`.trim()
            : `${firstName} ${lastName}`.trim();
        }
        if (docData.full_name) {
          fullName = docData.full_name.toUpperCase();
        }


        if (!fullName) {
          console.log(`Skipping document ${docSnapshot.id} - no name fields`);
          skippedCount++;
          continue;
        }


        // A page holds at most CONFIG.batchSize (500) docs, so one WriteBatch
        // per page stays within Firestore's 500-write limit.
        batch.update(docSnapshot.ref, { full_name: fullName });
        batchCount++;
      }


      if (batchCount > 0) {
        console.log(`Committing batch of ${batchCount} updates...`);
        await batch.commit();
      }

      // Save progress only after this page's writes are committed, so a resume
      // never skips past uncommitted updates.
      progress.lastProcessedId = lastDocId;
      progress.processedCount = processed;
      progress.skippedCount = skippedCount;
      progress.totalDocuments = totalDocuments;
      saveProgress(progress);

      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const docsPerSecond = processed / elapsedSeconds;
      console.log(`Progress: ${processed} documents processed (${docsPerSecond.toFixed(2)} docs/sec)`);
    }


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


    progress.lastProcessedId = lastDocId;
    progress.processedCount = processed;
    progress.skippedCount = skippedCount;
    progress.totalDocuments = totalDocuments;
    saveProgress(progress);

    throw error;
  }
}


(async () => {
  db = await initializeFirebase();
  await normalizeStateData();
  process.exit(0);
})().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
