import { US_STATES } from '@/constants/states';
import StatePageClient from './StatePageClient';

export async function generateStaticParams() {
  // Only generate pages for states that have data
  return US_STATES
    .filter(state => state.hasData)
    .map((state) => ({
      state: state.reference
    }));
}

export default function StatePage() {
  return <StatePageClient />;
}
