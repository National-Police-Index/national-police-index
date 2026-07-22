


import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collectionGroup,
  getDocs,
  writeBatch,
  QueryDocumentSnapshot,
  limit,
  startAfter,
  query,
  where
} from 'firebase/firestore';

import dotenv from 'dotenv';
import * as fs from 'fs';


dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
console.log(firebaseConfig);


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const targetState = process.argv[2]?.toLowerCase();

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


  const progress = loadProgress();
  if (progress.completed) {
    console.log('Process already completed. Delete progress file to run again.');
    return;
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

      let q = query(
        collectionGroup(db, 'db_launch'),
        where('state', '==', CONFIG.targetState.toLowerCase()),
        limit(CONFIG.batchSize)
      );


      if (lastDocSnapshot) {
        q = query(q, startAfter(lastDocSnapshot));
      } else if (lastDocId) {

        try {

          const lastDocQuery = query(
            collectionGroup(db, 'db_launch'),
            where('state', '==', CONFIG.targetState.toLowerCase()),
            where('__name__', '==', lastDocId),
            limit(1)
          );

          const lastDocQuerySnapshot = await getDocs(lastDocQuery);

          if (!lastDocQuerySnapshot.empty) {
            q = query(q, startAfter(lastDocQuerySnapshot.docs[0]));
            lastDocSnapshot = lastDocQuerySnapshot.docs[0];
          } else {
            console.log(`Could not find last processed document with ID: ${lastDocId}. Starting from the beginning.`);
            lastDocId = null;
          }
        } catch (error) {
          console.error('Error finding last document:', error);
          lastDocId = null;
        }
      }


      const querySnapshot = await getDocs(q);
      const batchSize = querySnapshot.size;

      if (batchSize === 0) {
        hasMoreDocs = false;
        continue;
      }

      totalDocuments += batchSize;
      console.log(`Processing batch of ${batchSize} documents...`);


      let batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of querySnapshot.docs) {
        const docData = docSnapshot.data();
        processed++;


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


        batch.update(docSnapshot.ref, { full_name: fullName });
        batchCount++;


        if (batchCount >= 500) {
          console.log(`Committing batch of ${batchCount} updates...`);
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }


        lastDocId = docSnapshot.id;
        lastDocSnapshot = docSnapshot;


        if (processed % 100 === 0) {
          progress.lastProcessedId = lastDocId;
          progress.processedCount = processed;
          progress.skippedCount = skippedCount;
          progress.totalDocuments = totalDocuments;
          saveProgress(progress);

          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const docsPerSecond = processed / elapsedSeconds;
          console.log(`Progress: ${processed} documents processed (${docsPerSecond.toFixed(2)} docs/sec)`);
        }
      }


      if (batchCount > 0) {
        console.log(`Committing final batch of ${batchCount} updates...`);
        await batch.commit();
      }
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


normalizeStateData().catch(console.error);
