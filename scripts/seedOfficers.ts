import * as admin from 'firebase-admin';
import { loadServiceAccount } from '../utils/loadServiceAccount';

async function initializeFirebase() {
  if (!admin.apps.length) {
    const serviceAccount = await loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin.firestore();
}

const sampleOfficers = [
  {
    id: 'officer1',
    personNbr: 'P123456',
    firstName: 'John',
    lastName: 'Smith',
    badge: '12345',
    department: 'New York Police Department',
    state: 'NY',
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'officer2',
    personNbr: 'P234567',
    firstName: 'Jane',
    lastName: 'Doe',
    badge: '23456',
    department: 'Los Angeles Police Department',
    state: 'CA',
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedOfficers() {
  const db = await initializeFirebase();
  const batch = db.batch();

  for (const officer of sampleOfficers) {
    const ref = db.collection('officers').doc(officer.id);
    batch.set(ref, officer);
  }

  await batch.commit();
  console.log('Successfully seeded officers');
}

// Execute if running directly
if (process.argv[1] === import.meta.url) {
  seedOfficers()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { seedOfficers };
