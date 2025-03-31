import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { StateData } from '@/types';
import { US_STATES } from '@/constants/states';
import { US_STATES_MAP } from '@/constants/states-map';

export const metadata = {
  title: 'State Data | National Police Index',
  description: 'Browse police officer records by state. Access employment histories, certification status, and more.',
};

async function _getStatesData() {
  const officersRef = collection(db, 'db_launch');
  const querySnapshot = await getDocs(officersRef);
  
  const stateStats = querySnapshot.docs.reduce((acc, doc) => {
    const state = doc.data().state;
    if (!state) return acc;
    
    if (!acc[state]) {
      acc[state] = { count: 0 };
    }
    acc[state].count++;
    return acc;
  }, {} as Record<string, { count: number }>);

  const statesData: StateData[] = Object.entries(stateStats).map(([state, data]) => ({
    name: state.charAt(0).toUpperCase() + state.slice(1),
    abbreviation: state.toUpperCase(),
    hasData: data.count > 0,
    totalOfficers: data.count
  }));

  return statesData.sort((a, b) => a.name.localeCompare(b.name));
}

function getStatesData() {
  const statesData: StateData[] = US_STATES.map(({name, hasData, abbreviation}) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    abbreviation,
    hasData,
    totalOfficers: 0
  }));

  return statesData.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function StatesPage() {
  const statesData = await getStatesData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Browse Records by State
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Select a state to view police officer records and employment histories
        </p>
      </div>

      <div className="relative w-full aspect-[4/3] max-w-4xl mx-auto mb-12 bg-gray-50 rounded-lg overflow-hidden">
        {Object.entries(US_STATES_MAP).map(([key, { svg }]) => {
          const state = statesData.find(s => s.abbreviation.toLowerCase() === key.toLowerCase());
          if (!state) return null;
          return svg({
            name: state.name,
            reference: state.abbreviation.toLowerCase(),
            hasData: state.hasData,
            key: key,
            count: state.totalOfficers
          }, (reference) => `/states/${reference}`);
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statesData.map((state) => (
          <Link
            key={state.abbreviation}
            href={state.hasData ? `/states/${state.abbreviation.toLowerCase()}` : '#'}
            className={`relative block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
              state.hasData ? 'border-blue-200 hover:border-blue-300' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{state.name}</h2>
                {state.hasData && state.totalOfficers && (
                  <p className="mt-1 text-sm text-gray-500">
                    {state.totalOfficers.toLocaleString()} officers
                  </p>
                )}
              </div>
              {state.hasData ? (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Coming Soon
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
