"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateAgencyStats } from "@/lib/calculateAgencyStats";

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
    description: "",
    stats: [],
    state: "",
    last_updated: new Date(),
    is_partial: false,
    pages_processed: 0,
  };
}

export function useAgencyStats(agencyName: string, stateId: string = "") {
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
          .replace(/[/\\]/g, "%2F")
          .replace(/[^a-z0-9-]/g, "-");

        //  const statsRef = doc(db, "statistics_per_agency", agencyId);
        // const statsDoc = await getDoc(statsRef);
        // if (statsDoc.exists()) {
        //  const statsData = statsDoc.data() as AgencyStats;

        let statsQuery = query(
          collection(db, "statistics_per_agency"),
          where("name", "==", agencyName)
        );

        if (stateId) {
          statsQuery = query(statsQuery, where("state", "==", stateId));
        }

        const statsSnapshot = await getDocs(statsQuery);

        if (!statsSnapshot.empty) {
          const statsData = statsSnapshot.docs[0].data() as AgencyStats;

          if (!statsData.stats) {
            statsData.stats = [];
          }

          setStats(statsData);
        } else {
          const calculatedStats = await calculateAgencyStats(
            agencyName,
            stateId
          );

          if (calculatedStats) {
            setStats(calculatedStats);
          } else {
            setStats(createDefaultStats(agencyName));
          }
        }
      } catch (err) {
        console.error(`Error in useAgencyStats for ${agencyName}:`, err);

        try {
          const calculatedStats = await calculateAgencyStats(
            agencyName,
            stateId
          );

          if (calculatedStats) {
            setStats(calculatedStats);
          } else {
            setStats(createDefaultStats(agencyName));
            setError(
              err instanceof Error
                ? err
                : new Error("Failed to fetch agency statistics"),
            );
          }
        } catch (calcErr) {
          setStats(createDefaultStats(agencyName));
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch agency statistics"),
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [agencyName]);

  return { loading, error, stats };
}
