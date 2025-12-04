const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  collectionGroup,
  getDocs,
  updateDoc,
  writeBatch,
  doc,
} = require("firebase/firestore");

const firebaseConfig = {
  // Add your Firebase config here
  // This should match the config in your lib/firebase.js file
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSearchQueries() {
  try {
    const querySnapshot = await getDocs(collectionGroup(db, "db_launch"));

    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const docData = docSnapshot.data();

      if (!docData.full_name) {
        skippedCount++;
        continue;
      }

      const fullName = docData.full_name;
      const searchQueries = fullName
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 0)
        .map((term) => term.toLowerCase());

      searchQueries.push(fullName.toLowerCase());

      const uniqueSearchQueries = [...new Set(searchQueries)];

      const docRef = doc(db, docSnapshot.ref.path);

      batch.update(docRef, { searchQueries: uniqueSearchQueries });
      batchCount++;
      updatedCount++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Error updating documents:", error);
  }
}

addSearchQueries()
  .then(() => console.log("Script completed successfully"))
  .catch((error) => console.error("Script failed:", error));
