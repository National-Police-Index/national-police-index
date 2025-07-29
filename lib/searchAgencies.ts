import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Cache to store all agencies by state
const agencyCache: {
  [state: string]: { 
    agencies: { name: string, count: number }[], 
    lastFetched: number,
    isComplete: boolean
  }
} = {};

// Expiry time for cache (4 hours)
const CACHE_EXPIRY_MS = 4 * 60 * 60 * 1000;

// Limit for initial quick load
const INITIAL_LIMIT = 100;

// Background loading flag to prevent duplicate loads
const isLoadingFullList: { [state: string]: boolean } = {};

/**
 * Get agencies for a specific state with pagination support
 */
export async function getAllAgencies(state: string): Promise<{ name: string, count: number }[]> {
  if (!state) return [];
  
  // Return from cache if available and not expired
  if (agencyCache[state] && 
      (Date.now() - agencyCache[state].lastFetched < CACHE_EXPIRY_MS)) {
    // Return the cached agencies
    return agencyCache[state].agencies;
  }

  try {
    // Fetch the first batch of agencies for immediate display
    // const agenciesRef = collection(db, 'statistics_per_agency');
    const agenciesRef = collection(db, 'agencies');
    const q = query(
      agenciesRef,
      where('state', '==', state.toLowerCase()),
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

    // Store in cache
    agencyCache[state] = {
      agencies,
      lastFetched: Date.now(),
      isComplete: false
    };
    
    // Start loading the full list in the background if not already loading
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
    console.log(`Loading all agencies for ${state} in background...`);
    const agenciesRef = collection(db, 'statistics_per_agency');
    
    // Query without limit to get all agencies
    const q = query(
      agenciesRef,
      where('state', '==', state.toLowerCase()),
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

    console.log(`Loaded all ${agencies.length} agencies for ${state}`);
    
    // Update the cache with the complete list
    agencyCache[state] = {
      agencies,
      lastFetched: Date.now(),
      isComplete: true
    };
  } catch (error) {
    console.error(`Error loading all agencies for ${state}:`, error);
  } finally {
    // Reset loading flag
    isLoadingFullList[state] = false;
  }
}

/**
 * Filter agencies by search term from the cache
 * This performs client-side filtering based on the full agency list
 */
export function filterAgenciesByTerm(state: string, searchTerm: string): { name: string, count: number }[] {
  if (!state || !searchTerm || searchTerm.length < 2) {
    // Return the first 100 agencies if no search term
    return agencyCache[state]?.agencies.slice(0, 100) || [];
  }

  // If we have the complete list in cache, filter it
  if (agencyCache[state]) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return agencyCache[state].agencies.filter(agency => 
      agency.name.toLowerCase().includes(lowerSearchTerm)
    ).slice(0, 100); // Limit to 100 matches to keep the UI responsive
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
    // Fall back to the original implementation for non-state specific searches
    try {
      const agenciesRef = collection(db, 'statistics_per_agency');
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
    // For state-specific searches, use our cached mechanism
    const filteredAgencies = filterAgenciesByTerm(state, searchTerm);
    return filteredAgencies.map(agency => agency.name);
  }
}
