// Advanced script to add searchQueries field to all documents in the db_launch collection
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collectionGroup,
  getDocs,
  writeBatch,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
  limit,
  startAfter,
  query
} from 'firebase/firestore';

// Import your existing Firebase config
// import { firebaseConfig } from '../lib/firebase';

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
console.log(firebaseConfig);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface OfficerDocument extends DocumentData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  searchQueries?: string[];
}

// Configuration options
const CONFIG = {
  batchSize: 500,         // Maximum batch size for Firestore
  queryLimit: 1000,       // Number of documents to process in each query
  dryRun: false,          // Set to true to simulate without making changes
  includeFirstLast: false, // Include first and last name separately
  logFrequency: 100,      // Log progress every N documents
};

async function addSearchQueries(): Promise<void> {
  try {
    console.log('Starting to add searchQueries field to documents...');
    console.log(`Configuration: ${JSON.stringify(CONFIG, null, 2)}`);

    let processed = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let totalDocuments = 0;
    let lastDoc: QueryDocumentSnapshot<OfficerDocument> | null = null;

    // Process documents in batches to avoid memory issues with large collections
    let hasMoreDocs = true;

    while (hasMoreDocs) {
      // Create query with pagination
      let dbQuery = collectionGroup(db, 'db_launch');
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
      console.log(`Processing batch of ${batchSize} documents...`);

      // Use batched writes for better performance
      let batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of querySnapshot.docs as QueryDocumentSnapshot<OfficerDocument>[]) {
        const docData = docSnapshot.data();
        processed++;

        // Get the full name, trying different field combinations
        let fullName = docData.full_name || '';
        if (!fullName && docData.first_name && docData.last_name) {
          fullName = `${docData.first_name} ${docData.last_name}`.trim();
        }

        // Skip if we couldn't determine a name
        if (!fullName) {
          console.log(`Skipping document ${docSnapshot.id} - no name fields`);
          skippedCount++;
          continue;
        }

        // Create searchQueries array from full_name
        const searchQueries: string[] = [];

        // Add full name terms
        fullName
          .trim()
          .split(/\s+/) // Split by any whitespace
          .filter(term => term.length > 0) // Remove empty terms
          .forEach(term => searchQueries.push(term.toLowerCase()));

        // Add the original full name in lowercase
        //searchQueries.push(fullName.toLowerCase());

        // Optionally add first and last name separately
        if (CONFIG.includeFirstLast && docData.first_name) {
          searchQueries.push(docData.first_name.toLowerCase());
        }

        if (CONFIG.includeFirstLast && docData.last_name) {
          searchQueries.push(docData.last_name.toLowerCase());
        }

        // Remove duplicates
        const uniqueSearchQueries = [...new Set(searchQueries)];

        // Get a reference to the document
        const docRef = doc(db, docSnapshot.ref.path);

        // Add to batch if not in dry run mode
        if (!CONFIG.dryRun) {
          batch.update(docRef, { searchQueries: uniqueSearchQueries });
        }

        batchCount++;
        updatedCount++;

        // Log progress periodically
        if (processed % CONFIG.logFrequency === 0) {
          console.log(`Processed ${processed} documents so far...`);
        }

        // If we've reached the batch size limit, commit and start a new batch
        if (batchCount >= CONFIG.batchSize && !CONFIG.dryRun) {
          console.log(`Committing batch of ${batchCount} updates...`);
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      // Commit any remaining updates
      if (batchCount > 0 && !CONFIG.dryRun) {
        console.log(`Committing final batch of ${batchCount} updates...`);
        await batch.commit();
      }

      // Update the last document for pagination
      lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] as QueryDocumentSnapshot<OfficerDocument>;

      // If we got fewer documents than the limit, we've reached the end
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
    Dry run mode: ${CONFIG.dryRun ? 'ON (no changes made)' : 'OFF (changes committed)'}
    ============================
    `);

  } catch (error) {
    console.error('Error updating documents:', error);
  }
}

// Run the function
addSearchQueries()
  .then(() => console.log('Script completed successfully'))
  .catch(error => console.error('Script failed:', error));
