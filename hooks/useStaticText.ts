'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StaticText {
  id: string;
  text: string;
  page: string;
  section: string;
}

// Cache for static texts to avoid multiple fetches
let staticTextsCache: { [key: string]: string } | null = null;

export function useStaticText(page: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [texts, setTexts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchTexts() {
      try {
        setLoading(true);
        setError(null);

        // Use cache if available
        if (staticTextsCache) {
          setTexts(staticTextsCache);
          setLoading(false);
          return;
        }

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
        setTexts(fetchedTexts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch static texts'));
      } finally {
        setLoading(false);
      }
    }

    fetchTexts();
  }, [page]);

  // Helper function to get text by section
  const getText = (section: string, defaultText: string = '') => {
    const key = `${page}.${section}`;
    return texts[key] || defaultText;
  };

  return { loading, error, getText };
}
