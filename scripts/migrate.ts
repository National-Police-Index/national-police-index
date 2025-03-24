const admin = require('firebase-admin');
const { initialPosts } = require('./seedData');
const { ServiceAccount } = require('firebase-admin');

// You'll need to download this from Firebase Console -> Project Settings -> Service Accounts
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    // Create a batch write
    const batch = db.batch();
    
    // Add all posts
    initialPosts.forEach((post) => {
      const docRef = db.collection('posts').doc(post.id);
      batch.set(docRef, {
        ...post,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Commit the batch
    await batch.commit();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

seedDatabase();
