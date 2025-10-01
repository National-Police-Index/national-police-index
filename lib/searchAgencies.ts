import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const agencyCache: {
  [state: string]: { 
    agencies: { name: string, count: number }[], 
    lastFetched: number,
    isComplete: boolean
  }
} = {};


const CACHE_EXPIRY_MS = 4 * 60 * 60 * 1000;


const INITIAL_LIMIT = 100;

// const AGENCY_COLLECTION = 'statistics_per_agency';
const AGENCY_COLLECTION = 'agencies';


const isLoadingFullList: { [state: string]: boolean } = {};

/**
 * Get agencies for a specific state with pagination support
 */
export async function getAllAgencies(state: string): Promise<{ name: string, count: number }[]> {
  if (!state) return [];
  
  
  if (agencyCache[state] && 
      (Date.now() - agencyCache[state].lastFetched < CACHE_EXPIRY_MS)) {
    
    return agencyCache[state].agencies;
  }

  try {
    
    
    const agenciesRef = collection(db, AGENCY_COLLECTION);
    const q = query(
      agenciesRef,
      // where('state', '==', state.toLowerCase()),
      where('state', 'in', [state.toLowerCase(), `${state.toLowerCase()}-discipline`]),
      orderBy('name'),
      limit(INITIAL_LIMIT)
    );

    const snapshot = await getDocs(q);
    const agencies: { name: string, count: number }[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        agencies.push({
          name: data.name,
          count: data.total_officers || 0
        });
      }
    });

    
    agencyCache[state] = {
      agencies,
      lastFetched: Date.now(),
      isComplete: false
    };
    
    
    if (!isLoadingFullList[state]) {
      isLoadingFullList[state] = true;
      loadAllAgenciesForState(state).catch(err => {
        console.error('Error loading all agencies:', err);
        isLoadingFullList[state] = false;
      });
    }

    return agencies;
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return [];
  }
}

/**
 * Load all agencies for a state in the background
 * This fetches all agencies without pagination limits
 */
async function loadAllAgenciesForState(state: string): Promise<void> {
  try {
    const agenciesRef = collection(db, AGENCY_COLLECTION);
    
    
    const q = query(
      agenciesRef,
      // where('state', '==', state.toLowerCase()),
      where('state', 'in', [state.toLowerCase(), `${state.toLowerCase()}-discipline`]),
      orderBy('name')
    );

    const snapshot = await getDocs(q);
    const agencies: { name: string, count: number }[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) {
        agencies.push({
          name: data.name,
          count: data.total_officers || 0
        });
      }
    });

   
    agencyCache[state] = {
      agencies,
      lastFetched: Date.now(),
      isComplete: true
    };
  } catch (error) {
    console.error(`Error loading all agencies for ${state}:`, error);
  } finally {
    
    isLoadingFullList[state] = false;
  }
}

/**
 * Filter agencies by search term from the cache
 * This performs client-side filtering based on the full agency list
 */
export function filterAgenciesByTerm(state: string, searchTerm: string): { name: string, count: number }[] {
  if (!state || !searchTerm || searchTerm.length < 2) {
    
    return agencyCache[state]?.agencies.slice(0, 100) || [];
  }

  
  if (agencyCache[state]) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return agencyCache[state].agencies.filter(agency => 
      agency.name.toLowerCase().includes(lowerSearchTerm)
    ).slice(0, 100); 
  }
  
  return [];
}

/**
 * Search for agencies in a specific state that match the search term
 * This function is kept for backward compatibility
 */
export async function searchAgencies(searchTerm: string, state?: string): Promise<string[]> {
  if (!searchTerm || searchTerm.length < 2) return [];
  if (!state) {
    
    try {
      const agenciesRef = collection(db, AGENCY_COLLECTION);
      const q = query(
        agenciesRef,
        orderBy('name'),
        limit(20)
      );

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
  } else {
    
    const filteredAgencies = filterAgenciesByTerm(state, searchTerm);
    return filteredAgencies.map(agency => agency.name);
  }
}
