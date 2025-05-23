// Script to add searchQueries field to all documents in the db_launch collection
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  collectionGroup, 
  getDocs, 
  updateDoc, 
  writeBatch, 
  doc 
} = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  // This should match the config in your lib/firebase.js file
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSearchQueries() {
  try {
    console.log('Starting to add searchQueries field to documents...');
    
    // Get all documents from the db_launch collection group
    const querySnapshot = await getDocs(collectionGroup(db, 'db_launch'));
    
    console.log(`Found ${querySnapshot.docs.length} documents to process`);
    
    // Use batched writes for better performance
    let batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore allows max 500 operations per batch
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const docData = docSnapshot.data();
      
      // Skip if the document doesn't have a full_name field
      if (!docData.full_name) {
        console.log(`Skipping document ${docSnapshot.id} - no full_name field`);
        skippedCount++;
        continue;
      }
      
      // Create searchQueries array from full_name
      const fullName = docData.full_name;
      const searchQueries = fullName
        .trim()
        .split(/\s+/) // Split by any whitespace
        .filter(term => term.length > 0) // Remove empty terms
        .map(term => term.toLowerCase());
      
      // Add the original full name in lowercase as well
      searchQueries.push(fullName.toLowerCase());
      
      // Remove duplicates
      const uniqueSearchQueries = [...new Set(searchQueries)];
      
      // Get a reference to the document
      const docRef = doc(db, docSnapshot.ref.path);
      
      // Add to batch
      batch.update(docRef, { searchQueries: uniqueSearchQueries });
      batchCount++;
      updatedCount++;
      
      // If we've reached the batch size limit, commit and start a new batch
      if (batchCount >= BATCH_SIZE) {
        console.log(`Committing batch of ${batchCount} updates...`);
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      console.log(`Committing final batch of ${batchCount} updates...`);
      await batch.commit();
    }
    
    console.log(`Done! Updated ${updatedCount} documents, skipped ${skippedCount} documents.`);
    
  } catch (error) {
    console.error('Error updating documents:', error);
  }
}

// Run the function
addSearchQueries()
  .then(() => console.log('Script completed successfully'))
  .catch(error => console.error('Script failed:', error));
