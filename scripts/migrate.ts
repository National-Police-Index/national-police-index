import * as admin from "firebase-admin";
import { initialPosts } from "./seedData.js";

interface Post {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  url: string;
}

import type { ServiceAccount } from "firebase-admin";

import serviceAccount from "../firebase-service-account.json" with {
  type: "json",
};

const typedServiceAccount = serviceAccount as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(typedServiceAccount),
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    const batch = db.batch();

    initialPosts.forEach((post: Post) => {
      const docRef = db.collection("posts").doc(post.id);
      batch.set(docRef, {
        ...post,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
