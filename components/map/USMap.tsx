'use client';

import React, { useState, useRef } from 'react';
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
  'coming_soon': 'bg-[#D7F4CE]',
  'some_data': 'bg-[#FFF5CC]',
  'no_data_tb': 'bg-[#FFE1C7]',
  'no_data_lb': 'bg-[#FAD2D2]',
};

export const DATA_FLAG_MESSAGES = {
  'full': 'Full Data Available',
  'coming_soon': 'Data Coming Soon',
  'some_data': 'Some Data Available',
  'no_data_tb': 'No Data (Technical Barrier)',
  'no_data_lb': 'No Data (Legal Barrier)',
};

export default function USMap() {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    stateName: string;
    message: string;
    direction?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    stateName: '',
    message: '',
    direction: undefined,
  });

  const handleStateClick = (stateReference: string) => {
    const stateData = US_STATES.find(state => state.reference.toLowerCase() === stateReference.toLowerCase());
    if (stateData?.hasData) {
      // Use window.location.href instead of router.push for proper history handling
      window.location.href = `/states/${stateReference.toLowerCase()}`;
    } else {
      if (stateData?.url) {
        window.open(stateData.url, '_self');
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, stateReference: string) => {
    const stateData = US_STATES.find(s => s.reference.toLowerCase() === stateReference.toLowerCase());

    if (stateData) {
      const message = DATA_FLAG_MESSAGES[stateData.dataFlag as keyof typeof DATA_FLAG_MESSAGES] || '';

      const eTarget = (e.target as HTMLElement).getBoundingClientRect();
      const wrapperRect = mapWrapperRef.current?.getBoundingClientRect();
      const relativeX = wrapperRect
        ? eTarget.left - wrapperRect.left + (eTarget.width * .2)
        : eTarget.left + (eTarget.width * .2)
      const relativeY = wrapperRect
        ? eTarget.top - wrapperRect.top + eTarget.height - (eTarget.height * .1)
        : eTarget.top + eTarget.height - (eTarget.height * .1)

      const mapWrapperWidth = mapWrapperRef.current?.offsetWidth || 0;
      let direction = 'left';
      if (relativeX > mapWrapperWidth * 0.7) {
        direction = 'right';
      }

      setTooltip({
        visible: true,
        x: relativeX,
        y: relativeY,
        stateName: stateData.name,
        message,
        direction,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div
      className={`w-full flex flex-column mx-auto flex-col ${styles.mapWrapper}`}
      ref={mapWrapperRef}
    >
      <div className="w-full sm:w-[100%] mx-auto items-center justify-center">
        <div className={styles.mapContainer}>
          <div>
            {US_STATES.map((state, index) => {
              const mapEntry = (US_STATES_MAP as unknown as StatesMap)[state.key];

              if (!mapEntry) return null;

              // Get the original SVG
              const originalSvg = mapEntry.renderSvg(state, handleStateClick);

              return (
                <div
                  key={index}
                  className={`${styles.stateItem} ${styles[state.dataFlag]}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStateClick(state.reference);
                    }
                  }}
                  tabIndex={0}
                >
                  <div
                    onMouseEnter={(e) => handleMouseEnter(e, state.reference)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {originalSvg}
                  </div>
                  {false && (US_STATES_MAP as unknown as StatesMap)[`_${state.key}`] &&
                    (US_STATES_MAP as unknown as StatesMap)[`_${state.key}`].renderSvg(state, (reference: string) => handleStateClick(reference))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className={`flex flex-row justify-center items-start lg:mx-auto ${styles.legendContainer}`}>
        <div className="flex justify-start items-center">
          <div className="bg-[#A1D1C1]" />
          <div className="FullDataAvailable font-normal font-['Inter'] leading-normal">Full Data Available</div>
        </div>
        <div className="flex justify-start items-center">
          <div className="bg-[#D7F4CE]" />
          <div className="text-center font-normal font-['Inter'] leading-normal">Data Coming Soon</div>
        </div>
        <div className="flex justify-start items-center">
          <div className="bg-[#FFF5CC]" />
          <div className="text-center font-normal font-['Inter'] leading-normal">Some Data Available</div>
        </div>
        <div className="flex justify-start items-center">
          <div className="bg-[#FFE1C7]" />
          <div className="text-center font-normal font-['Inter'] leading-normal">No Data (Technical Barrier)</div>
        </div>
        <div className="inline-flex justify-start items-center">
          <div className="bg-[#FAD2D2]" />
          <div className="text-center font-normal font-['Inter'] leading-normal">No Data (Legal Barrier)</div>
        </div>
      </div>

      <div
        className={`absolute z-10 ${styles.tooltip} ${tooltip.direction === 'right' && styles.tooltipRight} ${tooltip.visible && styles.tooltipVisible}`}
        style={{
          left: tooltip.x,
          top: tooltip.y,
        }}
      >
        <p>{tooltip.stateName}</p>
        <hr />
        <p>{tooltip.message}</p>
      </div>
    </div>
  );
}
