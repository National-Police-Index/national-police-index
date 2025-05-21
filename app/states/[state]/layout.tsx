import { Metadata } from 'next';
import { US_STATES } from '@/constants/states';

type Props = {
  children: React.ReactNode;
  params: { state: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Find the state data from the constants
  const stateData = US_STATES.find(
    s => s.reference.toLowerCase() === params.state.toLowerCase()
  );

  // Format the state name properly
  const stateName = stateData?.name || 
    params.state.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );

  return {
    title: `${stateName} Police Officers | National Police Index`,
    description: `Search and explore police officer records in ${stateName}. Find employment history, certification status, and disciplinary actions.`,
    openGraph: {
      title: `${stateName} Police Officers | National Police Index`,
      description: `Search and explore police officer records in ${stateName}. Find employment history, certification status, and disciplinary actions.`,
    },
    twitter: {
      title: `${stateName} Police Officers | National Police Index`,
      description: `Search and explore police officer records in ${stateName}. Find employment history, certification status, and disciplinary actions.`,
    },
  };
}

export default function StateLayout({ children }: Props) {
  return children;
}
