import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch, doc, QueryDocumentSnapshot } from 'firebase/firestore';
import { US_STATES } from '../constants/states';

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

interface StateStats {
  title: string;
  description: string;
  total_officers: number;
  total_officer_end_date: { [year: string]: number };
  total_officer_start_date: { [year: string]: number };
  last_updated: Date;
}

async function generateStateStats() {
  console.log('Starting state statistics generation...');
  const batch = writeBatch(db);
  const statsCollection = collection(db, 'state_statistics');

  for (const state of US_STATES) {
    console.log(`Processing state: ${state.name}`);
    const stateRef = state.reference.toLowerCase();

    // Query all officers for this state
    const officersRef = collection(db, 'db_launch');
    const officersQuery = query(officersRef, where('state', '==', stateRef));

    try {
      const snapshot = await getDocs(officersQuery);
      const endDateStats: { [year: string]: number } = {};
      const startDateStats: { [year: string]: number } = {};

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        
        // Process end dates
        if (data.end_date) {
          const endYear = new Date(data.end_date).getFullYear().toString();
          endDateStats[endYear] = (endDateStats[endYear] || 0) + 1;
        }

        // Process start dates
        if (data.start_date) {
          const startYear = new Date(data.start_date).getFullYear().toString();
          startDateStats[startYear] = (startDateStats[startYear] || 0) + 1;
        }
      });

      const stateStats: StateStats = {
        title: state.name,
        description: `Police officer records and history in ${state.name}`,
        total_officers: snapshot.size,
        total_officer_end_date: endDateStats,
        total_officer_start_date: startDateStats,
        last_updated: new Date()
      };

      // Add to batch
      const statsDoc = doc(statsCollection, stateRef);
      batch.set(statsDoc, stateStats);

      console.log(`Processed ${snapshot.size} officers for ${state.name}`);
    } catch (error) {
      console.error(`Error processing state ${state.name}:`, error);
    }
  }

  try {
    await batch.commit();
    console.log('Successfully updated state statistics');
  } catch (error) {
    console.error('Error committing batch:', error);
  }
}

// Function to be called monthly
export async function updateStateStatistics() {
  try {
    await generateStateStats();
    console.log('State statistics update completed successfully');
  } catch (error) {
    console.error('Error updating state statistics:', error);
    throw error;
  }
}

// Allow running directly from command line
if (require.main === module) {
  updateStateStatistics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
