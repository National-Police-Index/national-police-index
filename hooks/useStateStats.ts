'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StateStats {
  title: string;
  description: string;
  total_officers: number;
  total_officer_end_date: { [year: string]: number };
  total_officer_start_date: { [year: string]: number };
  last_updated: Date;
}

export function useStateStats(stateRef: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<StateStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        console.log('State reference', stateRef);
        const statsRef = doc(db, 'state_statistics', stateRef.toLowerCase());
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          setStats(statsDoc.data() as StateStats);
        } else {
          setError(new Error('No statistics found for this state'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch state statistics'));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [stateRef]);

  return { loading, error, stats };
}
