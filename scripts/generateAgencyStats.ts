const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, query, getDocs, writeBatch, doc, collection } = require('firebase/firestore');

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

interface StatItem {
  label: string;
  value: string;
}

interface AgencyStats {
  name: string;
  description: string;
  stats: StatItem[];
  state: string;
  last_updated: Date;
  is_partial?: boolean;
  pages_processed?: number;
}

async function generateAgencyStats() {
  // Get all unique agencies from the db_launch collection
  const officersRef = collectionGroup(db, 'db_launch');
  const snapshot = await getDocs(officersRef);
  
  // Map to store agency stats
  const agencyStatsMap = new Map<string, {
    name: string;
    state: string;
    officers: Set<string>;
    endDateStats: { [year: string]: number };
    startDateStats: { [year: string]: number };
  }>();

  // Process each officer document
  snapshot.forEach((doc: any) => {
    const data = doc.data();
    const agencyName = data.agency_name;
    const personNbr = data.person_nbr;
    const state = data.state;

    if (!agencyStatsMap.has(agencyName)) {
      agencyStatsMap.set(agencyName, {
        name: agencyName,
        state: state,
        officers: new Set(),
        endDateStats: {},
        startDateStats: {}
      });
    }

    const agencyStats = agencyStatsMap.get(agencyName)!;
    agencyStats.officers.add(personNbr);

    // Process start date
    if (data.start_date) {
      const startYear = new Date(data.start_date).getFullYear().toString();
      agencyStats.startDateStats[startYear] = (agencyStats.startDateStats[startYear] || 0) + 1;
    }

    // Process end date
    if (data.end_date) {
      const endYear = new Date(data.end_date).getFullYear().toString();
      agencyStats.endDateStats[endYear] = (agencyStats.endDateStats[endYear] || 0) + 1;
    }
  });

  // Create a batch to write all agency stats
  const batch = writeBatch(db);
  const statsCollection = collection(db, 'agency_statistics');

  // Convert agency stats map to Firestore documents
  for (const [agencyName, stats] of agencyStatsMap.entries()) {
    const agencyId = agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const agencyStats: AgencyStats = {
      name: stats.name,
      description: `Police officer records and history in ${stats.name}`,
      stats: [
        {
          label: 'Total Officers',
          value: stats.officers.size.toString()
        }
      ],
      state: stats.state,
      last_updated: new Date()
    };

    const statsDoc = doc(statsCollection, agencyId);
    batch.set(statsDoc, agencyStats);

    console.log(`Processed ${stats.officers.size} officers for ${stats.name}`);
  }

  try {
    await batch.commit();
    console.log('Successfully updated agency statistics');
  } catch (error) {
    console.error('Error committing batch:', error);
  }
}

// Function to be called monthly
export async function updateAgencyStatistics() {
  try {
    await generateAgencyStats();
    console.log('Agency statistics update completed successfully');
  } catch (error) {
    console.error('Error updating agency statistics:', error);
    throw error;
  }
}

// Allow running directly from command line
if (require.main === module) {
  updateAgencyStatistics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
