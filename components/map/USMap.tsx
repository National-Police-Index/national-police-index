'use client';

import React, { useState, useRef } from 'react';
import { US_STATES } from '@/constants/states';
import { State, US_STATES_MAP } from '@/constants/states-map';
import { trackMapInteraction } from '@/lib/analytics';
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
  'some_coming_soon': 'bg-[#D7F4CE]',
  'some_data': 'bg-[#FFF5CC]',
  'no_data_tb': 'bg-[#FFE1C7]',
  'no_data_lb': 'bg-[#FAD2D2]',
};

export const DATA_FLAG_MESSAGES = {
  'full': 'Full Data Available',
  'coming_soon': 'Data Coming Soon',
  'some_coming_soon': 'Some Data Coming Soon',
  'some_data': 'Some Data Available',
  'no_data_tb': 'No Data (Technical Barrier)',
  'no_data_lb': 'No Data (Legal Barrier)',
};

export const STATE_HOVER = {
  'alabama': "Legal barrier to release",
  'alaska': "Records from Alaska are still being processed",
  'arizona': "Employment history data from Arizona is available",
  'arkansas': "Claimed legal barrier to release",
  'california': "Employment history data from California is available",
  'colorado': "Legal barrier to release employment history data; ongoing appeal",
  'connecticut': "Technical barriers prevent the release of employment history data in Connecticut",
  'delaware': "Claimed legal barrier to release employment history data; ongoing appeal",
  'columbia': "Records from D.C. are still being processed",
  'florida': "Employment history data from Florida is available",
  'georgia': "Employment history data from Georgia is available",
  'hawaii': "Records from Hawaii are still being processed",
  'idaho': "Employment history data from Idaho is available",
  'illinois': "Employment history data from Illinois is available",
  'indiana': "Employment history data from Indiana is available",
  'iowa': "Records from Iowa are still being processed",
  'kansas': "Employment history data from Kansas is available",
  'kentucky': "Employment history data from Kentucky is available",
  'louisiana': "Limited employment history data from Louisiana is available through LLEAD",
  'maine': "Technical barriers prevent the release of employment history data in Maine",
  'maryland': "Employment history data from Maryland is available",
  'massachusetts': "Little employment history data exists in Massachusetts due to no certification system until 2021",
  'michigan': "Claimed legal barrier to release employment history data; ongoing appeal",
  'minnesota': "Employment history data from Minnesota is available",
  'mississippi': "Employment history data from Mississippi is available",
  'missouri': "Claimed legal barrier to release employment history data",
  'montana': "Claimed legal barrier to release employment history data",
  'nebraska': "Technical barriers prevent the release of employment history data in Nebraska",
  'nevada': "Claimed legal barrier to release employment history data",
  'new-hampshire': "Technical barriers prevent the release of employment history data in New Hampshire",
  'new-jersey': "Little employment history data exists in New Jersey due to no certification system until 2021",
  'new-mexico': "Employment history data from New Mexico is available",
  'new-york': "Claimed legal barrier to release employment history data; ongoing appeal",
  'north-carolina': "Employment history data from North Carolina is available",
  'north-dakota': "Records from North Dakota are still being processed",
  'ohio': "Employment history data from Ohio is available",
  'oklahoma': "Claimed legal barrier to release employment history data",
  'oregon': "Employment history data from Oregon is available",
  'pennsylvania': "Claimed legal barrier to release employment history data",
  'puerto-rico': "",
  'rhode-island': "Little employment history data exists in Rhode Island due to no certification system",
  'south-carolina': "Employment history data from South Carolina is available",
  'south-dakota': "Claimed legal barrier to release employment history data",
  'tennessee': "Employment history data from Tennessee is available",
  'texas': "Employment history data from Texas is available",
  'utah': "Employment history data from Utah is available",
  'vermont': "Employment history data from Vermont is available",
  'virginia': "Claimed legal barrier to release employment history data",
  'washington': "Employment history data from Washington is available",
  'west-virginia': "Employment history data from West Virginia is available",
  'wisconsin': "Claimed legal barrier to release employment history data; ongoing appeal",
  'wyoming': "Employment history data from Wyoming is available",
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
    
    // Track map interaction
    trackMapInteraction(stateData?.name || stateReference, 'click');
    
    if (stateData?.hasData) {
      // Use window.location.href instead of router.push for proper history handling
      window.location.href = `/states/${stateReference.toLowerCase()}`;
    } else {
      if (stateData?.url) {
        window.open(stateData.url, '_blank');
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, stateReference: string) => {
    const stateData = US_STATES.find(s => s.reference.toLowerCase() === stateReference.toLowerCase());

    if (stateData) {
      // Track hover interaction
      trackMapInteraction(stateData.name, 'hover');
      const message = DATA_FLAG_MESSAGES[stateData.dataFlag as keyof typeof DATA_FLAG_MESSAGES] || '';
      //will implement the state hover stuff at a later time, when the text is up to date
      //const message = STATE_HOVER[stateData.reference as keyof typeof STATE_HOVER] || '';

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

  const handleMouseLeave = (e: React.MouseEvent) => {
    setTooltip(prev => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      const tooltipElement = document.querySelector(`.${styles.tooltip}`);
      
      if (relatedTarget && tooltipElement && relatedTarget instanceof Node && tooltipElement?.contains(relatedTarget)) {
        return prev;
      }
      
      return { ...prev, visible: false };
    });
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
                  className={`${styles.stateItem} ${styles[state.dataFlag]} ${state.url || state.hasData ? styles.clickable : ''}`}
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
        onMouseLeave={handleMouseLeave}
      >
        <p className={styles.stateName}>{tooltip.stateName}</p>
        <hr />
        <p>{tooltip.message}</p>
      </div>
    </div>
  );
}
