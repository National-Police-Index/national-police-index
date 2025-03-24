'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { US_STATES } from '@/constants/states';
import { US_STATES_MAP } from '@/constants/states-map';

interface StateMapEntry {
  svg: React.ReactElement;
}

type StatesMap = {
  [key: string]: StateMapEntry;
};

export default function USMap() {
  const router = useRouter();

  const getStateColor = (stateAbbr: string) => {
    const stateData = US_STATES.find(state => state.abbreviation.toLowerCase() === stateAbbr.toLowerCase());
    if (!stateData) return '#E5E7EB'; // gray-200
    return stateData.hasData ? '#1D4ED8' : '#93C5FD'; // blue-700 : blue-300
  };

  const handleStateClick = (stateAbbr: string) => {
    const stateData = US_STATES.find(state => state.abbreviation.toLowerCase() === stateAbbr.toLowerCase());
    console.log(stateAbbr, stateData);
    if (stateData?.hasData) {
      router.push(`/states/${stateAbbr.toLowerCase()}`);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="aspect-[959/593] w-full relative">
          {US_STATES.map((state, index) => (
            <div key={state.key} className="absolute cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => handleStateClick(state.abbreviation)}
            onKeyDown={(e) => e.key === 'Enter' && handleStateClick(state.abbreviation)}
            role="button"
            tabIndex={index}

            >
              {(US_STATES_MAP as StatesMap)[state.key].svg}
            </div>
          ))}
          {/*
          <path
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
            className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          { Add other state paths here */}
      </div>
    </div>
  );
}
  /*
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="aspect-[959/593] w-full relative">
        <svg
          viewBox="0 0 959 593"
          className="w-full h-full absolute inset-0"
          role="img"
          aria-label="Interactive map of United States"
        >
          <title>United States Map</title>
          <desc>Click on a state to view police officer records</desc>
          
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
            className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </svg>
      </div>
      
      <div className="mt-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-center gap-8 sm:gap-12">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#1D4ED8]"></div>
            <span className="text-sm text-gray-700 font-medium">Records Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#93C5FD]"></div>
            <span className="text-sm text-gray-700 font-medium">Coming Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#E5E7EB]"></div>
            <span className="text-sm text-gray-700 font-medium">No Data</span>
          </div>
        </div>
      </div>
    </div>
  );
  */
