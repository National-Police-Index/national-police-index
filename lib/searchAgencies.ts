import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function searchAgencies(searchTerm: string): Promise<string[]> {
  if (!searchTerm || searchTerm.length < 3) return [];

  try {
    const agenciesRef = collection(db, 'db_launch');
    const q = query(
      agenciesRef,
      where('agency_name', '>=', searchTerm),
      where('agency_name', '<=', searchTerm + '\uf8ff'),
      orderBy('agency_name'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const agencies = new Set<string>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.agency_name) {
        agencies.add(data.agency_name);
      }
    });

    return Array.from(agencies);
  } catch (error) {
    console.error('Error searching agencies:', error);
    return [];
  }
}
