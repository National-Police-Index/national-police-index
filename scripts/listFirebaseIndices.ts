import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

async function listIndices() {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    console.log('\n=== Firebase Project Info ===');
    console.log(`Project ID: ${projectId}`);
    console.log(`\nTo view indices, you can:`);
    console.log(`1. Visit: https://console.firebase.google.com/project/${projectId}/firestore/indexes`);
    console.log(`2. Run: firebase firestore:indexes`);
    console.log(`\nAlternatively, I'll try to detect required indices from query errors...\n`);

    // Import necessary functions
    const { collectionGroup, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');

    // Test queries to detect missing indices
    const testQueries = [
      {
        name: 'Search with agency + searchQueries + last_name sort',
        query: async () => {
          const q = query(
            collectionGroup(db, 'db_launch'),
            where('agency_name', '==', 'Test Agency'),
            where('searchQueries', 'array-contains-any', ['test']),
            orderBy('last_name', 'asc'),
            limit(1)
          );
          return getDocs(q);
        }
      },
      {
        name: 'Search with agency + state + searchQueries + last_name sort',
        query: async () => {
          const q = query(
            collectionGroup(db, 'db_launch'),
            where('agency_name', '==', 'Test Agency'),
            where('state', '==', 'ca'),
            where('searchQueries', 'array-contains-any', ['test']),
            orderBy('last_name', 'asc'),
            limit(1)
          );
          return getDocs(q);
        }
      },
      {
        name: 'Search with agency + searchQueries + start_date sort',
        query: async () => {
          const q = query(
            collectionGroup(db, 'db_launch'),
            where('agency_name', '==', 'Test Agency'),
            where('searchQueries', 'array-contains-any', ['test']),
            orderBy('start_date', 'asc'),
            limit(1)
          );
          return getDocs(q);
        }
      },
      {
        name: 'Search with agency + state + searchQueries + start_date sort',
        query: async () => {
          const q = query(
            collectionGroup(db, 'db_launch'),
            where('agency_name', '==', 'Test Agency'),
            where('state', '==', 'ca'),
            where('searchQueries', 'array-contains-any', ['test']),
            orderBy('start_date', 'asc'),
            limit(1)
          );
          return getDocs(q);
        }
      },
    ];

    console.log('=== Testing Queries for Index Requirements ===\n');

    for (const test of testQueries) {
      console.log(`Testing: ${test.name}`);
      try {
        await test.query();
        console.log('✓ Query succeeded - Index exists\n');
      } catch (error: any) {
        if (error.message && error.message.includes('index')) {
          console.log('✗ Query failed - Missing index');
          console.log(`Error: ${error.message}\n`);

          // Extract index creation link if available
          const linkMatch = error.message.match(/https:\/\/[^\s]+/);
          if (linkMatch) {
            console.log(`Create index: ${linkMatch[0]}\n`);
          }
        } else {
          console.log(`✗ Query failed with error: ${error.message}\n`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

listIndices()
  .then(() => console.log('\nScript completed'))
  .catch(error => console.error('Script failed:', error));
