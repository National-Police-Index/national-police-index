'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface StatItem {
  label: string;
  value: string;
}

interface AgencyStats {
  name: string;
  description: string;
  stats: StatItem[];
  state: string;
  last_updated: Date;
  is_partial?: boolean;
  pages_processed?: number;
}

export function useAgencyStats(agencyName: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<AgencyStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const agencyId = agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        console.log('Agency ID:', agencyId);
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
  }, [agencyName]);

  return { loading, error, stats };
}
