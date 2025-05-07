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
  total_officers?: number;
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
        // Check the new collection first
        const statsRef = doc(db, 'statistics_per_agency', agencyId);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const statsData = statsDoc.data() as AgencyStats;
          console.log('statsData', statsData);
          
          // Ensure stats array exists and total_officers is reflected in stats
          if (!statsData.stats) {
            statsData.stats = [];
          }
          
          // Add or update the Total Officers stat if total_officers exists
          if (statsData.total_officers !== undefined) {
            // Check if Total Officers already exists in stats
            const totalOfficersStat = statsData.stats.find(stat => stat.label === 'Total Officers');
            
            if (totalOfficersStat) {
              totalOfficersStat.value = statsData.total_officers.toString();
            } else {
              statsData.stats.push({
                label: 'Total Officers',
                value: statsData.total_officers.toString()
              });
            }
          }
          
          setStats(statsData);
        } else {
          // Fallback to the old collection
          const oldStatsRef = doc(db, 'agency_statistics', agencyId);
          const oldStatsDoc = await getDoc(oldStatsRef);
          
          if (oldStatsDoc.exists()) {
            const statsData = oldStatsDoc.data() as AgencyStats;
            console.log('statsData (from old collection)', statsData);
            setStats(statsData);
          } else {
            setError(new Error('No statistics found for this agency'));
          }
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
