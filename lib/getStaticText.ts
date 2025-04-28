import { cache } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StaticText {
  id: string;
  text: string;
  page: string;
  section: string;
}

// Cache for static texts and version
let staticTextsCache: { [key: string]: string } | null = null;
let currentCacheVersion: string | null = null;

/**
 * Get the current cache version from Firebase
 */
async function getCacheVersion() {
  const versionRef = doc(db, 'system', 'static_texts_version');
  const versionDoc = await getDoc(versionRef);
  return versionDoc.exists() ? versionDoc.data().version : null;
}

/**
 * Clear the static text cache to force a fresh fetch from Firebase
 */
export function clearLocalCache() {
  staticTextsCache = null;
  currentCacheVersion = null;
}

export const getStaticText = cache(async () => {
  try {
    // Check cache version
    const serverVersion = await getCacheVersion();
    
    // Use cache if available and version matches
    if (staticTextsCache && currentCacheVersion === serverVersion) {
      return staticTextsCache;
    }
    
    // Update cache version
    currentCacheVersion = serverVersion;

    const textsRef = collection(db, 'static_texts');
    const snapshot = await getDocs(textsRef);
    const fetchedTexts: { [key: string]: string } = {};

    snapshot.forEach((doc) => {
      const data = doc.data() as StaticText;
      // Create a key in format: page.section
      const key = `${data.page}.${data.section}`;
      fetchedTexts[key] = data.text;
    });

    // Update cache
    staticTextsCache = fetchedTexts;
    return fetchedTexts;
  } catch (err) {
    console.error('Failed to fetch static texts:', err);
    return {};
  }
});

export function getText(texts: { [key: string]: string }, page: string, section: string, defaultText: string = '') {
  const key = `${page}.${section}`;
  return texts[key] || defaultText;
}
