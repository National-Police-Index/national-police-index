'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { US_STATES } from '@/constants/states';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isStatesOpen, setIsStatesOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stateColumns = useMemo(() => {
    const statesWithData = US_STATES.filter(state => state.hasData);
    const columns = [];
    const itemsPerColumn = Math.ceil(statesWithData.length / 6);
    
    for (let i = 0; i < statesWithData.length; i += itemsPerColumn) {
      columns.push(statesWithData.slice(i, i + itemsPerColumn));
    }
    
    return columns;
  }, []);

  return (
    <header className="bg-white">
        <div className="w-full px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-black text-3xl font-medium font-inter leading-10 tracking-tight">
            National Police Index
          </Link>
        <div className="flex justify-end items-center gap-8">
          <button
            onClick={() => setIsStatesOpen(!isStatesOpen)}
            className="flex justify-start items-center gap-4 cursor-pointer"
          >
            <span className="text-black text-lg font-normal font-inter leading-relaxed">
              State Data
            </span>
            <svg
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${!isStatesOpen ? 'rotate-180' : ''}`}
            >
              <path
                d="M1 5.74037L5.11616 1.62421C5.60227 1.1381 6.39773 1.1381 6.88384 1.62421L11 5.74037"
                stroke="black"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link href="/about" className="text-black text-lg font-normal font-inter leading-relaxed">
            About
          </Link>
        </div>
      </div>

      {/* States Dropdown */}
      {mounted && isStatesOpen && (
        <div className="w-full px-28 py-14 bg-white">
          <div className="w-[1224px] flex flex-col justify-start items-start gap-8">
            <div className="w-full flex flex-col justify-start items-start gap-2">
              <div className="w-full text-black text-lg font-normal font-inter leading-relaxed">
                State
              </div>
              <div className="w-full h-[1px] bg-black" />
            </div>
            <div className="w-full inline-flex justify-between items-start">
              {stateColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="inline-flex flex-col justify-start items-start gap-4">
                    {column.map((state) => (
                      <Link
                        key={state.reference}
                        href={`/states/${state.reference.toLowerCase()}`}
                        className="text-black text-base font-normal font-inter leading-normal hover:underline"
                      >
                        {state.name}
                      </Link>
                    ))}
                  </div>
                ))
              }
            </div>
            <Link
              href="#"
              className="text-black text-base font-bold font-inter leading-snug hover:underline"
            >
              Why isn't my state's data here?
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
