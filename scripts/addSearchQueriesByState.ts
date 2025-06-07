// Advanced script to add searchQueries field to all documents in the db_launch collection, processing state by state
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
  query,
  where
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Import dotenv for environment variables
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface OfficerDocument extends DocumentData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  searchQueries?: string[];
  state?: string;
}

// List of US states to process
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

// Configuration options
const CONFIG = {
  batchSize: 500,         // Maximum batch size for Firestore
  queryLimit: 1000,       // Number of documents to process in each query
  dryRun: false,          // Set to true to simulate without making changes
  includeFirstLast: false, // Include first and last name separately
  logFrequency: 100,      // Log progress every N documents
  logFile: '../search_queries_progress.json', // File to save progress
  specificState: process.argv[2] || null, // State to process, can be passed as command line argument
};

// Progress tracking
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

// Function to load progress data
function loadProgressData(): ProgressData {
  try {
    if (fs.existsSync(CONFIG.logFile)) {
      const data = fs.readFileSync(CONFIG.logFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading progress data:', error);
  }

  // Initialize new progress data
  return {
    states: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  };
}

// Function to save progress data
function saveProgressData(progressData: ProgressData): void {
  try {
    progressData.lastUpdatedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(progressData, null, 2));
  } catch (error) {
    console.error('Error saving progress data:', error);
  }
}

// Function to process a single state
async function processState(state: string, progressData: ProgressData): Promise<StateProgress> {
  console.log(`\n========== PROCESSING STATE: ${state.toUpperCase()} ==========`);

  // Check if state has already been completed
  const existingProgress = progressData.states.find(s => s.state === state);
  if (existingProgress && existingProgress.completed) {
    console.log(`State ${state} has already been processed. Skipping.`);
    return existingProgress;
  }

  // Initialize state progress
  const stateProgress: StateProgress = existingProgress || {
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
    let totalDocuments = 0;
    let lastDoc: QueryDocumentSnapshot<OfficerDocument> | null = null;

    // Process documents in batches to avoid memory issues with large collections
    let hasMoreDocs = true;

    while (hasMoreDocs) {
      // Create query with pagination and filter by state
      let dbQuery = collectionGroup(db, 'db_launch');
      dbQuery = query(dbQuery, where('state', '==', state));

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
      console.log(`Processing batch of ${batchSize} documents for state ${state}...`);

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
          console.log(`Processed ${processed} documents for state ${state} so far...`);

          // Update and save progress
          stateProgress.documentsProcessed = processed;
          stateProgress.documentsUpdated = updatedCount;
          stateProgress.documentsSkipped = skippedCount;
          stateProgress.lastProcessedAt = new Date().toISOString();

          // Update progress in the main data
          const stateIndex = progressData.states.findIndex(s => s.state === state);
          if (stateIndex >= 0) {
            progressData.states[stateIndex] = stateProgress;
          } else {
            progressData.states.push(stateProgress);
          }

          saveProgressData(progressData);
        }

        // If we've reached the batch size limit, commit and start a new batch
        if (batchCount >= CONFIG.batchSize && !CONFIG.dryRun) {
          console.log(`Committing batch of ${batchCount} updates for state ${state}...`);
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }

      // Commit any remaining updates
      if (batchCount > 0 && !CONFIG.dryRun) {
        console.log(`Committing final batch of ${batchCount} updates for state ${state}...`);
        await batch.commit();
      }

      // Update the last document for pagination
      lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] as QueryDocumentSnapshot<OfficerDocument>;

      // If we got fewer documents than the limit, we've reached the end
      if (querySnapshot.docs.length < CONFIG.queryLimit) {
        hasMoreDocs = false;
      }
    }

    // State processing completed
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
    return stateProgress;
  }
}

// Main function to process all states
async function addSearchQueriesByState(): Promise<void> {
  try {
    console.log('Starting to add searchQueries field to documents, processing state by state...');
    console.log(`Configuration: ${JSON.stringify(CONFIG, null, 2)}`);

    // Load progress data
    const progressData = loadProgressData();
    console.log(`Progress data loaded. ${progressData.states.length} states have progress information.`);

    // Determine which states to process
    let statesToProcess: string[] = [];

    if (CONFIG.specificState) {
      // Process only the specified state
      if (US_STATES.includes(CONFIG.specificState.toLowerCase())) {
        statesToProcess = [CONFIG.specificState.toLowerCase()];
      } else {
        console.error(`Invalid state specified: ${CONFIG.specificState}`);
        return;
      }
    } else {
      // Process all states
      statesToProcess = US_STATES;
    }

    console.log(`Will process ${statesToProcess.length} states: ${statesToProcess.join(', ')}`);

    // Process each state
    for (const state of statesToProcess) {
      const stateProgress = await processState(state, progressData);

      // Update progress data
      const stateIndex = progressData.states.findIndex(s => s.state === state);
      if (stateIndex >= 0) {
        progressData.states[stateIndex] = stateProgress;
      } else {
        progressData.states.push(stateProgress);
      }

      saveProgressData(progressData);
    }

    // Final summary
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
  }
}

// Run the function
addSearchQueriesByState()
  .then(() => console.log('Script completed successfully'))
  .catch(error => console.error('Script failed:', error));
