'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CurrentContributor {
  name: string;
  pronouns: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useCurrentContributors() {
  const [loading_cc, setLoading] = useState(true);
  const [error_cc, setError] = useState<Error | null>(null);
  const [currentContributors, setCurrentContributors] = useState<CurrentContributor[]>([]);

  useEffect(() => {
    async function fetchCurrentContributors() {
      try {
        setLoading(true);
        setError(null);

        const currentContributorRef = collection(db, 'current_contributors');
        const q = query(currentContributorRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const currentContributorList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            pronouns: data.pronouns,
            description: data.description,
            order: data.order,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } satisfies CurrentContributor;
        });

        setCurrentContributors(currentContributorList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching current contributors and volunteers:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch current contributors and volunteers'));
        setLoading(false);
      }
    }

    fetchCurrentContributors();
  }, []);

  return { loading_cc, error_cc, currentContributors };
}
