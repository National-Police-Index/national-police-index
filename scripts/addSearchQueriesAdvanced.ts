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
  writeBatch,
} from "firebase/firestore";

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
}

const CONFIG = {
  batchSize: 500,
  queryLimit: 1000,
  dryRun: false,
  includeFirstLast: false,
  logFrequency: 100,
};

async function addSearchQueries(): Promise<void> {
  try {
    let processed = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let totalDocuments = 0;
    let lastDoc: QueryDocumentSnapshot<OfficerDocument> | null = null;

    let hasMoreDocs = true;

    while (hasMoreDocs) {
      let dbQuery = collectionGroup(db, "db_launch");
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

    console.log(`
    ========== SUMMARY ==========
    Total documents found: ${totalDocuments}
    Documents processed: ${processed}
    Documents updated: ${updatedCount}
    Documents skipped: ${skippedCount}
    Dry run mode: ${CONFIG.dryRun ? "ON (no changes made)" : "OFF (changes committed)"}
    ============================
    `);
  } catch (error) {
    console.error("Error updating documents:", error);
  }
}

addSearchQueries()
  .then(() => console.log("Script completed successfully"))
  .catch((error) => console.error("Script failed:", error));
