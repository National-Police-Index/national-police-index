import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collectionGroup,
    query,
    getDocs,
    getDoc,
    writeBatch,
    doc,
    collection,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
    CollectionReference,
    Query,
    setDoc,
    where,
    orderBy
} from 'firebase/firestore';
import dotenv from 'dotenv';

interface State {
    name: string;
    reference: string;
    abbreviation: string;
    hasData: boolean;
    key: string;
    dataFlag: string;
    url?: string;
}

interface ProgressData {
    lastState: string;
    lastProcessed: string;
    totalProcessed: number;
}

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log(firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load states data
const { US_STATES } = require('../constants/states') as { US_STATES: State[] };

async function updateAgencyActiveStats(startState?: string) {
    try {
        // Get the last processed state from progress document
        const progressRef = doc(db, 'system', 'active_stats_progress');
        const progressDoc = await getDoc(progressRef);
        const lastState = progressDoc.exists() ? progressDoc.data()?.lastState || startState || 'alabama' : startState || 'alabama';

        // Find the index of the last processed state
        const states = US_STATES.filter((s: State) => s.hasData);
        let startIndex = states.findIndex((s: State) => s.reference === lastState);
        if (startIndex === -1) {
            startIndex = 0;
        }

        // Process each state sequentially
        for (let i = startIndex; i < states.length; i++) {
            const state = states[i];
            console.log(`\nProcessing state: ${state.name} (${state.reference})`);

            try {
                // Get agencies for this state
                const statsRef = collection(db, 'statistics_per_agency');
                const statsQuery = query(
                    statsRef,
                    where('state', '==', state.reference),
                    orderBy('name')
                );

                const statsSnapshot = await getDocs(statsQuery);
                if (statsSnapshot.empty) {
                    console.log(`No agencies found for state: ${state.name}`);
                    continue;
                }

                // Create a batch for updates
                const batch = writeBatch(db);
                let batchCount = 0;
                let processedCount = 0;

                for (const statDoc of statsSnapshot.docs) {
                    const agencyId = statDoc.id;
                    const agencyName = statDoc.data().name;
                    try {
                        // Get all active officers for this agency
                        const officersQuery = query(
                            collection(db, 'db_launch'),
                            where('agency_name', '==', agencyName),
                            where('end_date', '==', '')
                        );

                        const officersSnapshot = await getDocs(officersQuery);
                        const activeOfficerCount = officersSnapshot.size;

                        // Update the stats array with total_active_officers
                        const stats = statDoc.data().stats || [];
                        interface Stat {
                            name?: string;
                            label: string;
                            value: string;
                            updated_at?: string;
                        }

                        const existingActiveStat = stats.find((stat: Stat) => stat.label === 'Total Active Officers');

                        // If the stat already exists, update it, otherwise add it
                        if (existingActiveStat) {
                            existingActiveStat.value = activeOfficerCount.toString();
                        } else {
                            stats.push({
                                label: 'Total Active Officers',
                                value: activeOfficerCount.toString(),
                            });
                        }

                        // Update the document with batch
                        batch.update(statDoc.ref, {
                            stats: stats,
                            // updated_at: new Date().toISOString()
                        });
                        console.log(`Updated ${agencyId} in ${state.name}`, stats);

                        batchCount++;
                        processedCount++;

                        // Execute batch if it's full
                        if (batchCount >= 500) {
                            // await batch.commit();
                            batchCount = 0;
                            console.log(`Processed ${processedCount} agencies in ${state.name}`);
                        }

                    } catch (error) {
                        console.error(`Error processing agency ${agencyId} in ${state.name}:`, error);
                        continue;
                    }
                }

                // Commit any remaining updates
                if (batchCount > 0) {
                    await batch.commit();
                }

                // Update progress document
                await setDoc(progressRef, {
                    lastState: state.reference,
                    // lastProcessed: new Date().toISOString(),
                    totalProcessed: processedCount
                });

                console.log(`Completed processing ${processedCount} agencies in ${state.name}`);

            } catch (error) {
                console.error(`Error processing state ${state.name}:`, error);
                console.log('Continuing to next state...');
                continue;
            }
        }

        console.log('Successfully updated all agencies with active officer counts');
    } catch (error) {
        console.error('Error updating agency stats:', error);
        process.exit(1);
    }
}

// Run the update function
const startState = process.argv[2] || undefined; // Optional: pass a state reference to start from
updateAgencyActiveStats(startState as string | undefined);
