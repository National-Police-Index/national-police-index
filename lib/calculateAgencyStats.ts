import { 
  getFirestore, 
  collectionGroup, 
  query, 
  getDocs, 
  doc, 
  setDoc, 
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Collection names
const STATS_COLLECTION = 'statistics_per_agency'; 

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
  total_officers?: number;
}

/**
 * Calculate statistics for a single agency on-the-fly
 * This is a lighter version of the batch script in scripts/generateAgencyStats.ts
 * designed for on-demand calculation of a single agency's stats
 */
export async function calculateAgencyStats(agencyName: string): Promise<AgencyStats | null> {
  try {
    console.log(`Calculating statistics for agency: ${agencyName}`);
    
    // Create a valid document ID for the agency
    const agencyId = agencyName
      .toLowerCase()
      .replace(/[/\\]/g, '%2F') // Replace slashes with a descriptive replacement
      .replace(/[^a-z0-9-]/g, '-');
    
    // Reference to the officers collection for this agency
    const officersRef = collectionGroup(db, 'db_launch');
    
    // Query all officers in this agency
    const officersQuery = query(
      officersRef,
      where('agency_name', '==', agencyName),
      orderBy('person_nbr')
    );
    
    const officersSnapshot = await getDocs(officersQuery);
    
    // Initialize counters
    let totalOfficers = 0;
    let activeOfficers = 0;
    let inactiveOfficers = 0;
    let disciplinaryActions = 0;
    let state = '';
    
    // Maps to track unique officers and prevent double-counting
    const uniqueOfficers = new Map();
    const officersWithDiscipline = new Set();
    
    // Process officers
    officersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Extract state if not already set
      if (!state && data.state) {
        state = data.state.toLowerCase();
      }
      
      const personNbr = data.person_nbr;
      
      // Count unique officers
      if (personNbr && !uniqueOfficers.has(personNbr)) {
        uniqueOfficers.set(personNbr, data);
        totalOfficers++;
        
        // Count active vs inactive
        const isCurrentlyActive = data.is_active === true || 
                                 (!data.end_date || data.end_date === '');
        
        if (isCurrentlyActive) {
          activeOfficers++;
        } else {
          inactiveOfficers++;
        }
        
        // Count disciplinary actions
        if (data.has_discipline === true || 
            (data.discipline && data.discipline.length > 0) || 
            (data.separation_reason && 
             ['Terminated', 'Fired', 'Dismissed', 'Resigned under investigation', 
              'Resigned in lieu of termination'].includes(data.separation_reason))) {
          
          officersWithDiscipline.add(personNbr);
        }
      }
    });
    
    disciplinaryActions = officersWithDiscipline.size;
    
    // Create stats array
    const stats: StatItem[] = [
      { label: 'Total Officers', value: totalOfficers.toString() },
      { label: 'Active Officers', value: activeOfficers.toString() },
      { label: 'Inactive Officers', value: inactiveOfficers.toString() },
      { label: 'Officers with Discipline', value: disciplinaryActions.toString() }
    ];
    
    // Create the stats object
    const agencyStats: AgencyStats = {
      name: agencyName,
      description: `Statistics for ${agencyName}`,
      stats,
      state,
      total_officers: totalOfficers,
      last_updated: new Date(),
      is_partial: false
    };
    
    // Save the stats to Firestore
    await setDoc(doc(db, STATS_COLLECTION, agencyId), agencyStats);
    
    console.log(`Generated and saved statistics for ${agencyName}:`, stats);
    
    return agencyStats;
  } catch (error) {
    console.error(`Error calculating statistics for ${agencyName}:`, error);
    return null;
  }
}
