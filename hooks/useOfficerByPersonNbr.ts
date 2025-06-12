'use client';

import { useState, useEffect } from 'react';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PoliceOfficer } from '@/types';

interface OfficerData {
  records: PoliceOfficer[];
  latestRecord: PoliceOfficer;
}

export function useOfficerByPersonNbr(personNbr: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [officerData, setOfficerData] = useState<OfficerData | null>(null);
  console.log('personNbr', personNbr);
  useEffect(() => {
    async function fetchOfficer() {
      try {
        setLoading(true);
        setError(null);

        // Query all records for this officer using collection group
        const officersRef = collectionGroup(db, 'db_launch');
        let q = query(officersRef, where('document_id', '==', personNbr));
        console.log('personNbr.includes("discipline")', personNbr, personNbr.includes('discipline'));
        if (personNbr.includes('georgia') || personNbr.includes('florida')) {
          const documentId = personNbr.replace("florida-discipline_", "").replace("georgia-discipline_", "").replace("florida_", "").replace("georgia_", "");
          const state = personNbr.includes('florida') ? 'florida' : 'georgia';
          console.log('DocumentId', documentId, state);
          q = query(officersRef, where('person_nbr', '==', documentId), where('state', 'in', [state, `${state}-discipline`]));
        }
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log('Officer not found');
          throw new Error('Officer not found');
        }

        // Convert documents to PoliceOfficer objects and sort by date
        const records = snapshot.docs.map(doc => doc.data() as PoliceOfficer)
          .sort((a, b) => {
            const dateA = new Date(a.start_date).getTime();
            const dateB = new Date(b.start_date).getTime();
            return dateB - dateA; // Sort by most recent first
          });

        console.log('Records', records);
        setOfficerData({
          records,
          latestRecord: records[0]
        });
      } catch (err) {
        console.log('Error fetching officer', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch officer'));
      } finally {
        setLoading(false);
      }
    }

    if (personNbr) {
      fetchOfficer();
    }
  }, [personNbr]);

  return { loading, error, officerData };
}
