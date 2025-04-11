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

  const _handleStateClick = (stateReference: string) => {
    console.log(stateReference);
  };

  const handleStateClick = (stateReference: string) => {
    const stateData = US_STATES.find(state => state.reference.toLowerCase() === stateReference.toLowerCase());
    console.log(stateReference, stateData);
    if (stateData?.hasData) {
      router.push(`/states/${stateReference.toLowerCase()}`);
    }
  };

  return (
    <div className="w-full lg:mt-6 lg:mb-2 mx-auto flex-col sm:gap-2 lg:gap-6">
      <div className="w-full sm:w-[100%] mx-auto items-center justify-center">
        <div className={styles.mapContainer}>
          <div className={styles.mapWrapper}>
            {US_STATES.map((state, index) => (
              <div key={index} className={styles.stateItem}>
                {(US_STATES_MAP as unknown as StatesMap)[state.key] && (US_STATES_MAP as unknown as StatesMap)[state.key].renderSvg(state, (reference: string) => handleStateClick(reference))}
                {false && (US_STATES_MAP as unknown as StatesMap)[`_${state.key}`].renderSvg(state, (reference: string) => handleStateClick(reference))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-start lg:mx-auto gap-4 md:gap-4 lg:gap-6 lg:px-4">
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-emerald-200 rounded-lg" />
          <div className="FullDataAvailable text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Full Data Available</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-lime-100 rounded-lg" />
          <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Data Coming Soon</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg" />
          <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">Some Data Available</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-rose-100 rounded-lg" />
          <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">No Data (Technical Barrier)</div>
        </div>
        <div className="inline-flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-rose-200 rounded-lg" />
          <div className="text-center justify-start text-black text-base font-normal font-['Inter'] leading-normal">No Data (Legal Barrier)</div>
        </div>
      </div>

    </div>
  );
}
