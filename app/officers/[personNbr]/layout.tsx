import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';

type Props = {
  children: React.ReactNode;
  params: { personNbr: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch the officer data to get the name
  let officerName = '';
  let state = '';
  let nbr = '';
  let agencyName = '';

  try {
    // Query Firestore for the officer with this person_nbr using collectionGroup
    const officersRef = collectionGroup(db, 'db_launch');
    const q = query(officersRef, where('document_id', '==', params.personNbr), limit(1));
    const querySnapshot = await getDocs(q);

    console.log('OFFICER NAME', params.personNbr, querySnapshot.empty);
    if (!querySnapshot.empty) {
      const officerData = querySnapshot.docs[0].data();
      officerName = officerData.full_name ||
        `${officerData.first_name || ''} ${officerData.last_name || ''}`.trim();
      nbr = officerData.person_nbr;
      state = (officerData.state || '');
      try {
        state = state.charAt(0).toUpperCase() + state.slice(1);
      } catch (error) {
      }

      agencyName = officerData.agency_name || '';
    }
  } catch (error) {
    console.error('Error fetching officer data for metadata:', error);
  }

  // If we couldn't get the officer name, use a generic title with the person number
  const title = officerName
    ? `${state} / ${officerName} (${nbr}) | National Police Index`
    : `Officer Profile ${params.personNbr} | National Police Index`;

  const description = officerName && agencyName
    ? `View employment history and records for ${officerName} (ID: ${params.personNbr})${agencyName ? ` at ${agencyName}` : ''}.`
    : `View officer profile and employment history for ID: ${params.personNbr}.`;

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

export default function OfficerLayout({ children }: Props) {
  return children;
}
