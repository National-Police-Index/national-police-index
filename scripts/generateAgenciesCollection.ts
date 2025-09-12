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
  where,
  orderBy,
  Timestamp,
  startAfter
} from 'firebase/firestore';
import { US_STATES } from '@/constants/states';

interface DbLaunchDocument {
  agency_name?: string;
  state?: string;
}

interface AgencyData {
  name: string;
  state: string;
}


const BATCH_SIZE = 100;
const QUERY_LIMIT = 1000;
const MAX_PAGES = 1000;
const GC_INTERVAL = 5;


const AGENCIES_COLLECTION = 'agencies';
const DB_LAUNCH_COLLECTION = 'db_launch';


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


const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

async function generateAgenciesCollection() {
  try {

    initializeApp(firebaseConfig);
    const db = getFirestore();


    const dbLaunchRef = collectionGroup(db, DB_LAUNCH_COLLECTION);


    for (const state of US_STATES.reverse().filter(item => item.hasData)) {

    const uniqueAgencies = new Map<string, AgencyData>();


      let lastDoc: any = null;
      let hasMore = true;
      let currentPage = 0;

      while (hasMore && currentPage < MAX_PAGES) {
        currentPage++;

        try {

          let q = query(dbLaunchRef, where('state', '==', state.reference));

          if (lastDoc) {
            q = query(q, startAfter(lastDoc));
          }

          q = query(q, limit(QUERY_LIMIT));

          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            hasMore = false;
            break;
          }

          snapshot.forEach(doc => {
            const data = doc.data() as DbLaunchDocument;
            const agencyName = data.agency_name?.trim();

            if (agencyName && !uniqueAgencies.has(agencyName)) {
              uniqueAgencies.set(agencyName, { name: agencyName, state: state.reference });
            }
          });

          if (snapshot.docs.length > 0) {
            lastDoc = snapshot.docs[snapshot.docs.length - 1];
          }

          hasMore = snapshot.docs.length === QUERY_LIMIT;


          if (currentPage % GC_INTERVAL === 0 && typeof global.gc === 'function') {
            global.gc();
          }

        } catch (error) {
          console.error(`Error processing state ${state.reference} on page ${currentPage}:`, error);

          hasMore = false;
        }
      }


      if (uniqueAgencies.size > 0) {
        let batch = writeBatch(db);
        let batchCount = 0;

        for (const [agencyName, agencyData] of uniqueAgencies.entries()) {
          const docId = agencyName
            .toLowerCase()
            .replace(/[/\\]/g, '%2F')
            .replace(/[^a-z0-9-]/g, '-');

          const agencyRef = doc(collection(db, AGENCIES_COLLECTION), docId);

          const agencyDoc = {
            name: agencyName,
            state: agencyData.state,
            last_updated: Timestamp.now()
          };

          batch.set(agencyRef, agencyDoc);
          batchCount++;

          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
          }
        }


        if (batchCount > 0) {
          await batch.commit();
        }
      }


    let batch = writeBatch(db);
    let batchCount = 0;

    for (const [agencyName, agencyData] of uniqueAgencies.entries()) {

      const docId = agencyName
        .toLowerCase()
        .replace(/[/\\]/g, '%2F')
        .replace(/[^a-z0-9-]/g, '-');

      const agencyRef = doc(collection(db, AGENCIES_COLLECTION), docId);

      const agencyDoc = {
        name: agencyName,
        state: agencyData.state,
        last_updated: Timestamp.now()
      };

      batch.set(agencyRef, agencyDoc);
      batchCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;


        if (typeof global.gc === 'function') {
          global.gc();
        }
      }
    }


    if (batchCount > 0) {
      await batch.commit();
    }
    }
  } catch (error) {
    console.error('Error generating agencies collection:', error);
    throw error;
  }
}


async function main() {
  try {
    await generateAgenciesCollection();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
