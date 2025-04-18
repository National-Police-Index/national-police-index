'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { US_STATES } from '@/constants/states';
import { State, US_STATES_MAP } from '@/constants/states-map';
import styles from './USMap.module.scss';

export interface StateMapEntry {
  renderSvg: (state: State, onClick: (reference: string) => void) => React.ReactElement;
}

type StatesMap = {
  [key: string]: StateMapEntry;
};

export const DATA_FLAGS = {
  'full': 'bg-[#A1D1C1]',
  'comming_soon': 'bg-[#D7F4CE]',
  'some_data': 'bg-[#FFF5CC]',
  'no_data_tb': 'bg-[#FFE1C7]',
  'no_data_lb': 'bg-[#FAD2D2]',
};

export default function USMap() {
  const router = useRouter();

  const handleStateClick = (stateReference: string) => {
    const stateData = US_STATES.find(state => state.reference.toLowerCase() === stateReference.toLowerCase());
    console.log(stateReference, stateData);
    if (stateData?.hasData) {
      router.push(`/states/${stateReference.toLowerCase()}`);
    } else {
      if (stateData?.url) {
        window.open(stateData.url, '_blank');
      }
    }
  };

  return (
    <div className="w-full flex flex-column mx-auto flex-col sm:gap-2 lg:gap-12">
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
      <div className={`flex flex-col lg:flex-row justify-center items-start lg:mx-auto gap-4 md:gap-4 lg:gap-4 lg:px-4 ${styles.legendContainer}`}>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-[#A1D1C1] rounded-lg" />
          <div className="FullDataAvailable font-normal font-['Inter'] leading-normal">Full Data Available</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-[#D7F4CE] rounded-lg" />
          <div className="text-center font-normal font-['Inter'] leading-normal">Data Coming Soon</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-[#FFF5CC] rounded-lg" />
          <div className="text-center font-normal font-['Inter'] leading-normal">Some Data Available</div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-[#FFE1C7] rounded-lg" />
          <div className="text-center font-normal font-['Inter'] leading-normal">No Data (Technical Barrier)</div>
        </div>
        <div className="inline-flex justify-start items-center gap-4">
          <div className="w-8 h-8 bg-[#FAD2D2] rounded-lg" />
          <div className="text-center font-normal font-['Inter'] leading-normal">No Data (Legal Barrier)</div>
        </div>
      </div>

    </div>
  );
}
