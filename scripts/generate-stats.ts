import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';


const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
const serviceAccount = JSON.parse(
  readFileSync(serviceAccountPath, 'utf8')
) as ServiceAccount;

const US_STATES = [
  { name: 'Alaska', reference: 'alaska', abbreviation: 'AK', hasData: true },
  { name: 'Arizona', reference: 'arizona', abbreviation: 'AZ', hasData: true },
  { name: 'California', reference: 'california', abbreviation: 'CA', hasData: true },
  { name: 'Colorado', reference: 'colorado', abbreviation: 'CO', hasData: true },
  { name: 'Florida', reference: 'florida', abbreviation: 'FL', hasData: true },
  { name: 'Georgia', reference: 'georgia', abbreviation: 'GA', hasData: true },
  { name: 'Hawaii', reference: 'hawaii', abbreviation: 'HI', hasData: true },
  { name: 'Idaho', reference: 'idaho', abbreviation: 'ID', hasData: true },
  { name: 'Illinois', reference: 'illinois', abbreviation: 'IL', hasData: true },
  { name: 'Indiana', reference: 'indiana', abbreviation: 'IN', hasData: true },
  { name: 'Iowa', reference: 'iowa', abbreviation: 'IA', hasData: true },
  { name: 'Kansas', reference: 'kansas', abbreviation: 'KS', hasData: true },
  { name: 'Kentucky', reference: 'kentucky', abbreviation: 'KY', hasData: true },
  { name: 'Louisiana', reference: 'louisiana', abbreviation: 'LA', hasData: true },
  { name: 'Maine', reference: 'maine', abbreviation: 'ME', hasData: true },
  { name: 'Maryland', reference: 'maryland', abbreviation: 'MD', hasData: true },
  { name: 'Massachusetts', reference: 'massachusetts', abbreviation: 'MA', hasData: true },
  { name: 'Michigan', reference: 'michigan', abbreviation: 'MI', hasData: true },
  { name: 'Minnesota', reference: 'minnesota', abbreviation: 'MN', hasData: true },
  { name: 'Mississippi', reference: 'mississippi', abbreviation: 'MS', hasData: true },
  { name: 'Missouri', reference: 'missouri', abbreviation: 'MO', hasData: true },
  { name: 'Montana', reference: 'montana', abbreviation: 'MT', hasData: true },
  { name: 'Nebraska', reference: 'nebraska', abbreviation: 'NE', hasData: true },
  { name: 'Nevada', reference: 'nevada', abbreviation: 'NV', hasData: true },
  { name: 'New Hampshire', reference: 'new-hampshire', abbreviation: 'NH', hasData: true },
  { name: 'New Jersey', reference: 'new-jersey', abbreviation: 'NJ', hasData: true },
  { name: 'New Mexico', reference: 'new-mexico', abbreviation: 'NM', hasData: true },
  { name: 'New York', reference: 'new-york', abbreviation: 'NY', hasData: true },
  { name: 'North Carolina', reference: 'north-carolina', abbreviation: 'NC', hasData: true },
  { name: 'North Dakota', reference: 'north-dakota', abbreviation: 'ND', hasData: true },
  { name: 'Ohio', reference: 'ohio', abbreviation: 'OH', hasData: true },
  { name: 'Oklahoma', reference: 'oklahoma', abbreviation: 'OK', hasData: true },
  { name: 'Oregon', reference: 'oregon', abbreviation: 'OR', hasData: true },
  { name: 'Pennsylvania', reference: 'pennsylvania', abbreviation: 'PA', hasData: true },
  { name: 'Rhode Island', reference: 'rhode-island', abbreviation: 'RI', hasData: true },
  { name: 'South Carolina', reference: 'south-carolina', abbreviation: 'SC', hasData: true },
  { name: 'South Dakota', reference: 'south-dakota', abbreviation: 'SD', hasData: true },
  { name: 'Tennessee', reference: 'tennessee', abbreviation: 'TN', hasData: true },
  { name: 'Texas', reference: 'texas', abbreviation: 'TX', hasData: true },
  { name: 'Utah', reference: 'utah', abbreviation: 'UT', hasData: true },
  { name: 'Vermont', reference: 'vermont', abbreviation: 'VT', hasData: true },
  { name: 'Virginia', reference: 'virginia', abbreviation: 'VA', hasData: true },
  { name: 'Washington', reference: 'washington', abbreviation: 'WA', hasData: true },
  { name: 'West Virginia', reference: 'west-virginia', abbreviation: 'WV', hasData: true },
  { name: 'Wisconsin', reference: 'wisconsin', abbreviation: 'WI', hasData: true },
  { name: 'Wyoming', reference: 'wyoming', abbreviation: 'WY', hasData: true }
];


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testConnection() {
  try {
    const testRef = db.collection('_test_connection');
    await testRef.limit(1).get();
    return true;
  } catch (error) {
    console.error('Failed to connect to Firestore:', error);
    return false;
  }
}

async function generateStateStats() {
  try {
    await testConnection();
    const testState = US_STATES[0];

    try {
      const officersRef = db.collectionGroup('db_launch');

      const CHUNK_SIZE = 1000;
      let lastDoc = null;
      let totalOfficers = 0;

      while (true) {
        let query = officersRef.orderBy('document_id').limit(CHUNK_SIZE);
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const snapshot = await query.get();
        const batchSize = snapshot.size;
        if (batchSize === 0) break;

        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.state === testState.reference) {
            totalOfficers++;
          }
        });

        lastDoc = snapshot.docs[snapshot.docs.length - 1];

        if (batchSize < CHUNK_SIZE) break;
      }

      const stateStats = {
        title: testState.name,
        description: `Police officer records and history in ${testState.name}`,
        stats: [
          {
            label: 'Total Officers',
            value: totalOfficers.toString()
          }
        ],
        last_updated: new Date()
      };

      const statsDoc = db.collection('statistics_per_state').doc(testState.reference.toLowerCase());
      await statsDoc.set(stateStats);
    } catch (error) {
      console.error('Error processing state:', error);
      throw error;
    }
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

async function main() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Cannot proceed without a working connection to Firebase');
    process.exit(1);
  }

  try {
    await generateStateStats();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
