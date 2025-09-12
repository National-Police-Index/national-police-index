require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, query, getDocs, writeBatch, doc, collection } = require('firebase/firestore');
const { US_STATES } = require('../constants/states');

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

async function generateStateStats() {
  const statsCollection = collection(db, 'statistics_per_state');

  for (const state of US_STATES) {
    const officersRef = collectionGroup(db, 'db_launch');
    const snapshot = await getDocs(officersRef);

    let totalOfficers = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.state === state.reference) {
        totalOfficers++;
      }
    });

    const stateStats = {
      title: state.name,
      description: `Police officer records and history in ${state.name}`,
      stats: [
        {
          label: 'Total Officers',
          value: totalOfficers.toString()
        }
      ],
      last_updated: new Date()
    };

    const statsDoc = doc(statsCollection, state.reference.toLowerCase());
    await setDoc(statsDoc, stateStats);
  }
}

generateStateStats()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
