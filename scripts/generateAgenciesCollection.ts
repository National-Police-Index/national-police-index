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

// Configure chunk sizes for memory management
const BATCH_SIZE = 100; // Number of writes per batch
const QUERY_LIMIT = 1000; // Number of documents per query
const MAX_PAGES = 1000; // Safety limit for pagination
const GC_INTERVAL = 5; // Run garbage collection every 5 pages

// Collection names
const AGENCIES_COLLECTION = 'agencies';
const DB_LAUNCH_COLLECTION = 'db_launch';

// Load environment variables
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

// Validate required environment variables
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
    // Initialize Firebase
    initializeApp(firebaseConfig);
    const db = getFirestore();

    console.log('Starting agencies collection generation...');
    
    // Get reference to db_launch collection
    const dbLaunchRef = collectionGroup(db, DB_LAUNCH_COLLECTION);
    
    // Map to store unique agencies
    const uniqueAgencies = new Map<string, { name: string; state: string }>();
    
    // Pagination variables
    let lastDoc: any = null;
    let hasMore = true;
    let currentPage = 0;
    
    console.log('Discovering unique agencies...');
    
    while (hasMore && currentPage < MAX_PAGES) {
      currentPage++;
      
      // Build query
      let q = query(dbLaunchRef);
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      q = query(q, limit(QUERY_LIMIT));
      
      try {
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          hasMore = false;
          break;
        }
        
        snapshot.forEach(doc => {
          const data = doc.data();
          const agencyName = data.agency_name?.trim();
          const state = data.state?.trim();
          
          if (agencyName && state && !uniqueAgencies.has(agencyName)) {
            uniqueAgencies.set(agencyName, { name: agencyName, state });
          }
        });
        
        if (snapshot.docs.length > 0) {
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
        }
        
        hasMore = snapshot.docs.length === QUERY_LIMIT;
        
        console.log(`Discovered ${uniqueAgencies.size} unique agencies so far... (page ${currentPage})`);
        
        // Run garbage collection periodically
        if (currentPage % GC_INTERVAL === 0 && typeof global.gc === 'function') {
          global.gc();
        }
        
      } catch (error) {
        console.error(`Error on page ${currentPage}:`, error);
        // Continue to next page even if this one failed
        hasMore = false;
      }
    }
    
    console.log(`Found ${uniqueAgencies.size} unique agencies. Starting to save to collection...`);
    
    // Save agencies to the new collection
    let batch = writeBatch(db);
    let batchCount = 0;
    
    for (const [agencyName, agencyData] of uniqueAgencies.entries()) {
      // Create a valid document ID
      const docId = agencyName
        .toLowerCase()
        .replace(/[/\\]/g, '%2F') // Replace slashes with a descriptive replacement
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
        console.log(`Saved batch of ${batchCount} agencies`);
        batch = writeBatch(db);
        batchCount = 0;
        
        // Run garbage collection after each batch
        if (typeof global.gc === 'function') {
          global.gc();
        }
      }
    }
    
    // Commit final batch if any remaining
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Saved final batch of ${batchCount} agencies`);
    }
    
    console.log('Agencies collection generation completed successfully');
    
  } catch (error) {
    console.error('Error generating agencies collection:', error);
    throw error;
  }
}

// Run the script
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
