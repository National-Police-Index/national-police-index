'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { US_STATES } from '@/constants/states';
import { State, US_STATES_MAP } from '@/constants/states-map';
import styles from './USMap.module.css';

export interface StateMapEntry {
  renderSvg: (state: State, onClick: (reference: string) => void) => React.ReactElement;
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
    <div className="w-full lg:mt-6 lg:mb-6 mx-auto flex-col sm:gap-2 lg:gap-6">
      <div className="w-full sm:w-[100%] md:w-5/7 lg:w-5/6 mx-auto items-center justify-center">
        <div className={styles.mapContainer}>
          <div className={styles.mapWrapper}>
            {US_STATES.map((state, index) => (
              <div key={index} className={styles.stateItem}>
                {(US_STATES_MAP as unknown as StatesMap)[state.key].renderSvg(state, (reference: string) => handleStateClick(reference))}
                {(US_STATES_MAP as unknown as StatesMap)[`_${state.key}`].renderSvg(state, (reference: string) => handleStateClick(reference))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-center lg:items-start sm:items-start lg:mx-auto sm:gap-4 lg:gap-6 lg:px-4">
        <div className="flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-gray-200" />
          <div className="FullDataAvailable text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Full Data Available</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-stone-300" />
          <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Data Coming Soon</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-6 h-6 bg-neutral-400" />
          <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Some Data Available</div>
        </div>
        <div className="flex justify-start items-center gap-4">
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
