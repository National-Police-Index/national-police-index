'use client';

import { useRouter } from 'next/navigation';
import { StateData } from '@/types';

interface USMapProps {
  statesData: StateData[];
}

export default function USMap({ statesData }: USMapProps) {
  const router = useRouter();

  const getStateColor = (stateAbbr: string) => {
    const stateData = statesData.find(state => state.abbreviation.toLowerCase() === stateAbbr.toLowerCase());
    if (!stateData) return '#e5e7eb'; // gray-200
    return stateData.hasData ? '#2563eb' : '#93c5fd'; // blue-600 : blue-300
  };

  const handleStateClick = (stateAbbr: string) => {
    const stateData = statesData.find(state => state.abbreviation.toLowerCase() === stateAbbr.toLowerCase());
    if (stateData?.hasData) {
      router.push(`/states/${stateAbbr.toLowerCase()}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg
        viewBox="0 0 959 593"
        className="w-full h-auto"
        role="img"
        aria-label="Interactive map of United States"
      >
        <title>United States Map</title>
        <desc>Click on a state to view police officer records</desc>
        
        {/* Add state paths here - this is just an example, you'll need to add all state paths */}
        <path
          d="M161.1 453.7l-14.9 1.6-14.8 1.4-14.9 1-15 .8-15.1.6-15.1.2-15.2-.1-15.2-.4-.4-10.2-.3-10.2-.2-10.3-.1-10.3.1-10.3.2-10.3.3-10.2.4-10.2 15.2-.4 15.2-.1 15.1.2 15.1.6 15 .8 14.9 1 14.8 1.4 14.9 1.6.4 10.2.3 10.2.2 10.3.1 10.3-.1 10.3-.2 10.3-.3 10.2-.4 10.2z"
          fill={getStateColor('CA')}
          stroke="#fff"
          strokeWidth="1"
          role="button"
          aria-label="California"
          tabIndex={0}
          onClick={() => handleStateClick('CA')}
          onKeyDown={(e) => e.key === 'Enter' && handleStateClick('CA')}
          className="cursor-pointer hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Add more state paths here */}
      </svg>
      
      <div className="mt-8">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Records Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-300 mr-2"></div>
            <span className="text-sm text-gray-600">Coming Soon</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 mr-2"></div>
            <span className="text-sm text-gray-600">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
