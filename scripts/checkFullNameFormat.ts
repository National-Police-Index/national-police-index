import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, query, where, limit, getDocs } from 'firebase/firestore';

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

async function checkFormat() {
  try {
    // Get a few sample documents - try different state formats
    console.log('Trying state = "ca"...');
    let q = query(
      collectionGroup(db, 'db_launch'),
      where('state', '==', 'ca'),
      limit(5)
    );

    let snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} documents\n`);

    if (snapshot.docs.length === 0) {
      console.log('Trying state = "CA"...');
      q = query(
        collectionGroup(db, 'db_launch'),
        where('state', '==', 'CA'),
        limit(5)
      );
      snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} documents\n`);
    }

    if (snapshot.docs.length === 0) {
      console.log('Trying without state filter...');
      q = query(
        collectionGroup(db, 'db_launch'),
        limit(5)
      );
      snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} documents\n`);
    }

    snapshot.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`Document ${i + 1}:`);
      console.log(`  state: "${data.state}"`);
      console.log(`  full_name: "${data.full_name}"`);
      console.log(`  full_name_lower: "${data.full_name_lower}"`);
      console.log(`  first_name: "${data.first_name}"`);
      console.log(`  last_name: "${data.last_name}"`);
      console.log(`  searchQueries: ${JSON.stringify(data.searchQueries?.slice(0, 3))}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkFormat()
  .then(() => console.log('Done'))
  .catch(error => console.error('Failed:', error));
