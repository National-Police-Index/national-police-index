'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Partner {
  name: string;
  pronouns: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function usePartners() {
  const [loading_p, setLoading] = useState(true);
  const [error_p, setError] = useState<Error | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    async function fetchPartners() {
      try {
        setLoading(true);
        setError(null);

        const partnerRef = collection(db, 'partners');
        const q = query(partnerRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const partnerList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            pronouns: data.pronouns,
            description: data.description,
            order: data.order,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } satisfies Partner;
        });

        setPartners(partnerList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching partners:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch partners'));
        setLoading(false);
      }
    }

    fetchPartners();
  }, []);

  return { loading_p, error_p, partners };
}
