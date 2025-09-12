'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateAgencyStats } from '@/lib/calculateAgencyStats';

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


function createDefaultStats(agencyName: string): AgencyStats {
  return {
    name: agencyName,
    description: '',
    stats: [],
    state: '',
    last_updated: new Date(),
    is_partial: false,
    pages_processed: 0,
  };
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

        
        
        
        const agencyId = agencyName
          .toLowerCase()
          .replace(/[/\\]/g, '%2F') 
          .replace(/[^a-z0-9-]/g, '-');
        
        const statsRef = doc(db, 'statistics_per_agency', agencyId);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const statsData = statsDoc.data() as AgencyStats;

          
          if (!statsData.stats) {
            statsData.stats = [];
          }

          
          setStats(statsData);
        } else {
          const oldStatsRef = doc(db, 'agency_statistics', agencyId);
          const oldStatsDoc = await getDoc(oldStatsRef);
          if (oldStatsDoc.exists()) {
            const statsData = oldStatsDoc.data() as AgencyStats;
            setStats(statsData);
          } else {
          
          
          const calculatedStats = await calculateAgencyStats(agencyName);
          
          if (calculatedStats) {
            setStats(calculatedStats);
          } else {
            
            setStats(createDefaultStats(agencyName));
          }
          }
        }
      } catch (err) {
        console.error(`Error in useAgencyStats for ${agencyName}:`, err);
        
        
        try {
          const calculatedStats = await calculateAgencyStats(agencyName);
          
          if (calculatedStats) {
            setStats(calculatedStats);
          } else {
            setStats(createDefaultStats(agencyName));
            setError(err instanceof Error ? err : new Error('Failed to fetch agency statistics'));
          }
        } catch (calcErr) {
          
          setStats(createDefaultStats(agencyName));
          setError(err instanceof Error ? err : new Error('Failed to fetch agency statistics'));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [agencyName]);

  return { loading, error, stats };
}
