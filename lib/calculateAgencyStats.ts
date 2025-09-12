import { 
  collectionGroup, 
  query, 
  getDocs, 
  doc, 
  setDoc, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';


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
    
    
    const agencyId = agencyName
      .toLowerCase()
      .replace(/[/\\]/g, '%2F') 
      .replace(/[^a-z0-9-]/g, '-');
    
    
    const officersRef = collectionGroup(db, 'db_launch');
    
    
    const officersQuery = query(
      officersRef,
      where('agency_name', '==', agencyName),
      orderBy('person_nbr')
    );
    
    const officersSnapshot = await getDocs(officersQuery);
    
    
    let totalOfficers = 0;
    let activeOfficers = 0;
    let inactiveOfficers = 0;
    let disciplinaryActions = 0;
    let state = '';
    
    
    const uniqueOfficers = new Map();
    const officersWithDiscipline = new Set();
    
    
    officersSnapshot.forEach(doc => {
      const data = doc.data();
      
      
      if (!state && data.state) {
        state = data.state.toLowerCase();
      }
      
      const personNbr = data.person_nbr;
      
      
      if (personNbr && !uniqueOfficers.has(personNbr)) {
        uniqueOfficers.set(personNbr, data);
        totalOfficers++;
        
        
        const isCurrentlyActive = data.is_active === true || 
                                 (!data.end_date || data.end_date === '');
        
        if (isCurrentlyActive) {
          activeOfficers++;
        } else {
          inactiveOfficers++;
        }
        
        
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
    
    
    const stats: StatItem[] = [
      { label: 'Total Officers', value: totalOfficers.toString() },
      { label: 'Active Officers', value: activeOfficers.toString() },
      { label: 'Inactive Officers', value: inactiveOfficers.toString() },
      { label: 'Officers with Discipline', value: disciplinaryActions.toString() }
    ];
    
    
    const agencyStats: AgencyStats = {
      name: agencyName,
      description: `Statistics for ${agencyName}`,
      stats,
      state,
      total_officers: totalOfficers,
      last_updated: new Date(),
      is_partial: false
    };
    
   
    await setDoc(doc(db, STATS_COLLECTION, agencyId), agencyStats);
    
    return agencyStats;
  } catch (error) {
    console.error(`Error calculating statistics for ${agencyName}:`, error);
    return null;
  }
}
