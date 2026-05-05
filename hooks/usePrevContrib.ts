'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PreviousContributor {
  name: string;
  pronouns: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function usePreviousContributors() {
  const [loading_pc, setLoading] = useState(true);
  const [error_pc, setError] = useState<Error | null>(null);
  const [previousContributors, setPreviousContributors] = useState<PreviousContributor[]>([]);

  useEffect(() => {
    async function fetchPreviousContributors() {
      try {
        setLoading(true);
        setError(null);

        const previousContributorRef = collection(db, 'previous_contributors');
        const q = query(previousContributorRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const previousContributorList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            pronouns: data.pronouns,
            description: data.description,
            order: data.order,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } satisfies PreviousContributor;
        });

        setPreviousContributors(previousContributorList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Previous contributors and volunteers:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch previous contributors and volunteers'));
        setLoading(false);
      }
    }

    fetchPreviousContributors();
  }, []);

  return { loading_pc, error_pc, previousContributors };
}
