'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { US_STATES } from '@/constants/states';
import { US_STATES_MAP } from '@/constants/states-map';

export interface StateMapEntry {
  svg: React.ReactElement;
}

type StatesMap = {
  [key: string]: StateMapEntry;
};

export default function USMap() {
  const router = useRouter();

  const getStateColor = (stateReference: string) => {
    const stateData = US_STATES.find(state => state.reference.toLowerCase() === stateReference.toLowerCase());
    if (!stateData) return '#E5E7EB'; // gray-200
    return stateData.hasData ? '#1D4ED8' : '#93C5FD'; // blue-700 : blue-300
  };

  const handleStateClick = (stateReference: string) => {
    const stateData = US_STATES.find(state => state.reference.toLowerCase() === stateReference.toLowerCase());
    console.log(stateReference, stateData);
    if (stateData?.hasData) {
      router.push(`/states/${stateReference.toLowerCase()}`);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mt-6 mx-auto px-4 sm:px-6 lg:px-8 relative flex flex-row gap-auto">
      <div className="aspect-[959/483] w-full relative">
          {US_STATES.map((state, index) => (
            <>
              {(US_STATES_MAP as StatesMap)[state.key].svg(state, (reference: string) => handleStateClick(reference))}
              {(US_STATES_MAP as StatesMap)[`_${state.key}`].svg(state, (reference: string) => handleStateClick(reference))}

</>
          ))}
      </div>
        <div className="inline-flex flex-col justify-start items-start gap-6">
          <div className="inline-flex justify-start items-center gap-4">
            <div className="w-6 h-6 bg-gray-200" />
            <div className="FullDataAvailable text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Full Data Available</div>
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            <div className="w-6 h-6 bg-stone-300" />
            <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Data Coming Soon</div>
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            <div className="w-6 h-6 bg-neutral-400" />
            <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Some Data Available</div>
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            <div className="w-6 h-6 bg-neutral-500" />
            <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">No Data (Technical Barrier)</div>
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            <div className="w-6 h-6 bg-zinc-700" />
            <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">No Data (Legal Barrier)</div>
          </div>
        </div>
 
    </div>
  );
}
  