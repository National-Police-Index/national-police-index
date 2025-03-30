'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AgencyStats {
  name: string;
  description: string;
  total_officers: number;
  total_officer_end_date: { [year: string]: number };
  total_officer_start_date: { [year: string]: number };
  state: string;
  last_updated: Date;
}

export function useAgencyStats(agencyId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<AgencyStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const statsRef = doc(db, 'agency_statistics', agencyId);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const statsData = statsDoc.data() as AgencyStats;
          console.log('statsData', statsData);
          setStats(statsData);
        } else {
          setError(new Error('No statistics found for this agency'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch agency statistics'));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [agencyId]);

  return { loading, error, stats };
}
