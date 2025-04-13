'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeamMember {
  name: string;
  pronouns: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useTeam() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true);
        setError(null);

        const teamRef = collection(db, 'team');
        const q = query(teamRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const teamList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            name: data.name,
            pronouns: data.pronouns,
            description: data.description,
            order: data.order,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } satisfies TeamMember;
        });

        setTeamMembers(teamList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch team members'));
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  return { loading, error, teamMembers };
}
