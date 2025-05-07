import { collection, query, where, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Get all agencies for a specific state
 */
export async function getAllAgencies(state: string): Promise<{name: string, count: number}[]> {
  if (!state) return [];
  
  try {
    const agenciesRef = collection(db, 'statistics_per_agency');
    const q = query(
      agenciesRef,
      where('state', '==', state.toLowerCase()),
      orderBy('name'),
      limit(100) // Limit to prevent loading too many agencies
    );

    const snapshot = await getDocs(q);
    const agencies: {name: string, count: number}[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        agencies.push({
          name: data.name,
          count: data.total_officers || 0
        });
      }
    });

    return agencies;
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return [];
  }
}

/**
 * Search for agencies in a specific state that match the search term
 */
export async function searchAgencies(searchTerm: string, state?: string): Promise<string[]> {
  if (!searchTerm || searchTerm.length < 2) return [];

  try {
    const agenciesRef = collection(db, 'statistics_per_agency');
    
    // Build query based on whether state is provided
    let q;
    if (state) {
      q = query(
        agenciesRef,
        where('state', '==', state.toLowerCase()),
        orderBy('name'),
        limit(10)
      );
    } else {
      q = query(
        agenciesRef,
        orderBy('name'),
        limit(10)
      );
    }

    const snapshot = await getDocs(q);
    const agencies = new Set<string>();
    const searchTermLower = searchTerm.toLowerCase();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name && data.name.toLowerCase().includes(searchTermLower)) {
        agencies.add(data.name);
      }
    });

    return Array.from(agencies);
  } catch (error) {
    console.error('Error searching agencies:', error);
    return [];
  }
}
