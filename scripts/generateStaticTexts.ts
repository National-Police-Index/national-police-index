import type { ServiceAccount } from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../firebase-service-account.json' assert { type: 'json' };


const typedServiceAccount = serviceAccount as ServiceAccount;


if (getApps().length === 0) {
  initializeApp({
    credential: cert(typedServiceAccount)
  });
}

const db = getFirestore();

const staticTexts = [

  { id: 'header-site-name', page: 'header', section: 'site-name', text: 'National Police Index' },
  { id: 'header-nav-home', page: 'header', section: 'nav-home', text: 'Home' },
  { id: 'header-nav-states', page: 'header', section: 'nav-states', text: 'States' },
  { id: 'header-nav-about', page: 'header', section: 'nav-about', text: 'About' },


  { id: 'footer-site-title', page: 'footer', section: 'site-title', text: 'National Police Index' },
  { id: 'footer-copyright', page: 'footer', section: 'copyright', text: '© 2024 National Police Index. All rights reserved.' },
  { id: 'footer-nav-about', page: 'footer', section: 'nav-about', text: 'About' },
  { id: 'footer-nav-privacy', page: 'footer', section: 'nav-privacy', text: 'Privacy' },


  { id: 'officer-card-uid-label', page: 'officer-card', section: 'uid-label', text: 'UID' },
  { id: 'officer-card-agency-label', page: 'officer-card', section: 'agency-label', text: 'Agency' },
  { id: 'officer-card-position-label', page: 'officer-card', section: 'position-label', text: 'Position' },
  { id: 'officer-card-position-not-specified', page: 'officer-card', section: 'position-not-specified', text: 'Not specified' },


  { id: 'home-title', page: 'home', section: 'title', text: 'National Police Index' },
  { id: 'home-subtitle', page: 'home', section: 'subtitle', text: 'Search and explore police officer records across the United States' },
  { id: 'home-states-count', page: 'home', section: 'states-count', text: 'States with public records' },
  { id: 'home-officers-count', page: 'home', section: 'officers-count', text: 'Officers in database' },


  { id: 'states-title', page: 'states', section: 'title', text: 'Browse Records by State' },
  { id: 'states-subtitle', page: 'states', section: 'subtitle', text: 'Select a state to view police officer records and employment histories' },


  { id: 'state-officers-title', page: 'state', section: 'officers-title', text: 'Officers in {state}' },
  { id: 'state-total-officers', page: 'state', section: 'total-officers', text: 'Total Officers' },
  { id: 'state-active-records', page: 'state', section: 'active-records', text: 'Active Records' },


  { id: 'agency-title', page: 'agency', section: 'title', text: 'Agency Details' },
  { id: 'agency-total-officers', page: 'agency', section: 'total-officers', text: 'Total Officers' },
  { id: 'agency-active-records', page: 'agency', section: 'active-records', text: 'Active Records' },
];

async function generateStaticTexts() {
  try {
    const batch = db.batch();


    for (const text of staticTexts) {
      const ref = db.collection('static_texts').doc(text.id);
      batch.set(ref, {
        ...text,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }


    const versionRef = db.collection('system').doc('static_texts_version');
    batch.set(versionRef, {
      version: Date.now().toString(),
      updatedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error('Error generating static texts:', error);
  } finally {
    process.exit(0);
  }
}

generateStaticTexts();
