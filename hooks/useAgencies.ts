"use client";

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";

interface AgencyData {
  id: string;
  name: string;
  description: string;
  total_officers: number;
  state: string;
  last_updated: Date;
}

interface Agency extends Omit<AgencyData, "last_updated"> {
  name: string;
  description: string;
  total_officers: number;
  state: string;
  last_updated: Date;
}

export function useAgencies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [agencies, setAgencies] = useState<AgencyData[]>([]);

  useEffect(() => {
    async function fetchAgencies() {
      try {
        setLoading(true);
        setError(null);

        const agenciesRef = collection(db, "agency_statistics");
        const q = query(agenciesRef, orderBy("name"));
        const snapshot = await getDocs(q);

        const agencyList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            total_officers: data.total_officers,
            state: data.state,
            last_updated: data.last_updated.toDate(),
          } satisfies AgencyData;
        });

        setAgencies(agencyList);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch agencies"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAgencies();
  }, []);

  return { loading, error, agencies };
}
