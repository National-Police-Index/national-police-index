import type { ServiceAccount } from "firebase-admin";
import * as admin from "firebase-admin";

import serviceAccount from "../firebase-service-account.json" with {
  type: "json",
};

const typedServiceAccount = serviceAccount as ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(typedServiceAccount),
});

const db = admin.firestore();

const teamMembers = [
  {
    name: "Sam Stecklow",
    pronouns: "(he/him)",
    description:
      "An investigative journalist and FOIA fellow with [Invisible Institute](https://invisible.institute). He works on Invisible Institute's [Civic Police Data Project](https://cpdp.co) and investigations.",
    order: 1,
  },
  {
    name: "Ayyub Ibrahim",
    pronouns: "(he/him)",
    description:
      "A programmer at the Berkeley Institute for Data Science (BIDS). He previously served as the Director of Research for the Innocence Project New Orleans' [Louisiana Law Enforcement Accountability Database (LLEAD)](https://llead.co) and is the founder of Machine Learning Justice Lab.",
    order: 2,
  },
  {
    name: "Tarak Shah",
    pronouns: "(he/they)",
    description:
      "A data scientist at the [Human Rights Data Analysis Group](https://hrdag.org). He works with community organizations, lawyers, journalists, international human rights institutions, and transitional justice mechanisms to support campaigns for accountability through quantitative analysis. He currently serves as program manager of the Community Law Enforcement Network.",
    order: 3,
  },
  {
    name: "Bailey Passmore",
    pronouns: "(they/them)",
    description:
      "Has been working as a Data Scientist at the [Human Rights Data Analysis Group](https://hrdag.org) since 2022.",
    order: 4,
  },
  {
    name: "Olive Lavine",
    pronouns: "(she/her)",
    description:
      "A volunteer developer on this project. She studied mathematics at Tulane University and software engineering at Ada Developers Academy.",
    order: 5,
  },
  {
    name: "Maheen Khan",
    pronouns: "(she/her)",
    description:
      "Invisible Institute's Director of Technology. She studied Information Analysis and Computer Science at the University of Michigan. At [Invisible Institute](https://invisible.institute), she primarily works to maintain the [Civic Police Data Project](https://cpdp.co).",
    order: 6,
  },
  {
    name: "Chaclyn Hunt",
    pronouns: "(she/her)",
    description:
      "Invisible Institute's legal director and a civil rights attorney.",
    order: 7,
  },
  {
    name: "Maira Khwaja",
    pronouns: "(she/her)",
    description: "Invisible Institute's director of public strategy.",
    order: 8,
  },
  {
    name: "Kaitlynn Cassady",
    pronouns: "(she/her)",
    description:
      "The communications manager at [Invisible Institute](https://invisible.institute).",
    order: 9,
  },
  {
    name: "Lisa Pickoff-White",
    pronouns: "",
    description: "California Reporting Project",
    order: 10,
  },
];

async function seedTeamData() {
  try {
    const batch = db.batch();

    teamMembers.forEach((member) => {
      const docRef = db.collection("team").doc();
      batch.set(docRef, {
        ...member,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log("Team data seeded successfully");
  } catch (error) {
    console.error("Error seeding team data:", error);
  } finally {
    process.exit(0);
  }
}

seedTeamData();
