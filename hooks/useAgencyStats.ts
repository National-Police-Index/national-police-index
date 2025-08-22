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

// Helper function to create default stats
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

        // Sanitize agency name to create a valid Firebase document ID
        // First, specifically handle forward and back slashes as they cause path issues in Firebase
        // Then replace all other non-alphanumeric characters with hyphens
        const agencyId = agencyName
          .toLowerCase()
          .replace(/[/\\]/g, '%2F') // Replace slashes with a descriptive replacement
          .replace(/[^a-z0-9-]/g, '-');
        // Check the new collection first
        const statsRef = doc(db, 'statistics_per_agency', agencyId);
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const statsData = statsDoc.data() as AgencyStats;

          // Ensure stats array exists and total_officers is reflected in stats
          if (!statsData.stats) {
            statsData.stats = [];
          }

          // Add or update the Total Officers stat if total_officers exists
          setStats(statsData);
        } else {
          const oldStatsRef = doc(db, 'agency_statistics', agencyId);
          const oldStatsDoc = await getDoc(oldStatsRef);
          if (oldStatsDoc.exists()) {
            const statsData = oldStatsDoc.data() as AgencyStats;
            setStats(statsData);
          } else {
            console.log(`No existing stats found for ${agencyName}, calculating on-the-fly...`);
          
          // Try to calculate stats on-the-fly
          const calculatedStats = await calculateAgencyStats(agencyName);
          
          if (calculatedStats) {
            setStats(calculatedStats);
          } else {
            // Fall back to default stats if calculation fails
            setStats(createDefaultStats(agencyName));
          }
          }
        }
      } catch (err) {
        console.error(`Error in useAgencyStats for ${agencyName}:`, err);
        
        // Try to calculate stats on-the-fly even in case of error
        try {
          console.log(`Attempting to calculate stats for ${agencyName} after error...`);
          const calculatedStats = await calculateAgencyStats(agencyName);
          
          if (calculatedStats) {
            console.log(`Successfully calculated stats for ${agencyName} after error`);
            setStats(calculatedStats);
          } else {
            setStats(createDefaultStats(agencyName));
            setError(err instanceof Error ? err : new Error('Failed to fetch agency statistics'));
          }
        } catch (calcErr) {
          // If calculation also fails, fall back to defaults
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
