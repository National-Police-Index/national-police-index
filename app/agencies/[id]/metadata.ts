import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Decode the agency ID from the URL
  const decodedAgencyId = decodeURIComponent(params.id);
  let agencyName = decodedAgencyId; // Default to the ID if we can't fetch the name
  let officerCount = 0;
  
  try {
    // Try to get agency stats from Firestore
    const statsRef = collection(db, 'statistics_per_agency');
    const q = query(statsRef, where('agency_id', '==', decodedAgencyId), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const agencyData = querySnapshot.docs[0].data();
      // Use the agency name from stats if available
      if (agencyData.name) {
        agencyName = agencyData.name;
      }
      
      // Get officer count if available
      if (agencyData.stats) {
        const officerStats = agencyData.stats.find((stat: any) => stat.label === 'Total Officers');
        if (officerStats) {
          officerCount = parseInt(officerStats.value, 10);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching agency data for metadata:', error);
  }

  const title = `${agencyName} Police Department | National Police Index`;
  const description = officerCount 
    ? `View ${officerCount} police officers at ${agencyName}. Search employment records, certification status, and disciplinary actions.`
    : `View police officers at ${agencyName}. Search employment records, certification status, and disciplinary actions.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}
