import { Metadata } from 'next';
import { US_STATES } from '@/constants/states';

type Props = Promise<{ children: React.ReactNode; state: string }>;

export async function generateMetadata({ params }: { params: Props }): Promise<Metadata> {
  // Find the state data from the constants

  const { state } = await params;
  const stateData = US_STATES.find(
    s => s.reference.toLowerCase() === state.toLowerCase()
  );

  // Format the state name properly
  const stateName = stateData?.name ||
    state.replace(
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

export default function StateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
