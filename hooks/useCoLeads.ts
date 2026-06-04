'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CoLead {
  name: string;
  pronouns: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useCoLeads() {
  const [loading_cl, setLoading] = useState(true);
  const [error_cl, setError] = useState<Error | null>(null);
  const [coLeads, setCoLeads] = useState<CoLead[]>([]);

  useEffect(() => {
    async function fetchCoLeads() {
      try {
        setLoading(true);
        setError(null);

        const coLeadRef = collection(db, 'co_leads');
        const q = query(coLeadRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const currentCoLeadList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            pronouns: data.pronouns,
            description: data.description,
            order: data.order,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } satisfies CoLead;
        });

        setCoLeads(currentCoLeadList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching co-leads:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch co-leads'));
        setLoading(false);
      }
    }

    fetchCoLeads();
  }, []);

  return { loading_cl, error_cl, coLeads };
}
