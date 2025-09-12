import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';

type Props = Promise<{ children: React.ReactNode; personNbr: string }>;

export async function generateMetadata({ params }: { params: Props }): Promise<Metadata> {

  
  const { personNbr } = await params;
  const decodedPersonNbr = decodeURIComponent(personNbr);

  
  let officerName = '';
  let state = '';
  let nbr = '';
  let agencyName = '';

  try {
    
    const officersRef = collectionGroup(db, 'db_launch');
    const q = query(officersRef, where('document_id', '==', decodedPersonNbr), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const officerData = querySnapshot.docs[0].data();
      officerName = officerData.full_name ||
        `${officerData.first_name || ''} ${officerData.last_name || ''}`.trim();
      nbr = officerData.person_nbr;
      state = (officerData.state || '');
      try {
        state = state.charAt(0).toUpperCase() + state.slice(1);
      } catch (error) {
        console.log(error);
      }

      agencyName = officerData.agency_name || '';
    }
  } catch (error) {
    console.error('Error fetching officer data for metadata:', error);
  }

 
  const title = officerName
    ? `${state} / ${officerName} (${nbr}) | National Police Index`
    : `Officer Profile ${decodedPersonNbr} | National Police Index`;

  const description = officerName && agencyName
    ? `View employment history and records for ${officerName} (ID: ${decodedPersonNbr})${agencyName ? ` at ${agencyName}` : ''}.`
    : `View officer profile and employment history for ID: ${decodedPersonNbr}.`;

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

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
