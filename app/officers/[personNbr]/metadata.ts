import { Metadata } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';

type Props = {
  params: { personNbr: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch the officer data to get the name
  let officerName = '';
  let agencyName = '';

  try {
    // Query Firestore for the officer with this person_nbr using collectionGroup
    const officersRef = collectionGroup(db, 'db_launch');
    const q = query(officersRef, where('person_nbr', '==', params.personNbr));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const officerData = querySnapshot.docs[0].data();
      officerName = officerData.full_name ||
        `${officerData.first_name || ''} ${officerData.last_name || ''}`.trim();
      agencyName = officerData.agency_name || '';
    }
  } catch (error) {
    console.error('Error fetching officer data for metadata:', error);
  }

  // If we couldn't get the officer name, use a generic title with the person number
  console.log('OFFICER NAME', officerName);
  const title = officerName
    ? `${officerName} (${params.personNbr}) | National Police Index`
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
