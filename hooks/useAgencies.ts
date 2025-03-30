'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Agency {
  name: string;
  description: string;
  total_officers: number;
  state: string;
  last_updated: Date;
}

export function useAgencies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);

  useEffect(() => {
    async function fetchAgencies() {
      try {
        setLoading(true);
        setError(null);

        const agenciesRef = collection(db, 'agency_statistics');
        const q = query(agenciesRef, orderBy('name'));
        const snapshot = await getDocs(q);

        const agencyList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          last_updated: doc.data().last_updated.toDate()
        })) as Agency[];

        console.log('agencyList', agencyList);
        setAgencies(agencyList);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch agencies'));
      } finally {
        setLoading(false);
      }
    }

    fetchAgencies();
  }, []);

  return { loading, error, agencies };
}
