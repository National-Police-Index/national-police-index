'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import { US_STATES } from '@/constants/states';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsStatesOpen(false);
    setIsMobileMenuOpen(false);

    // Close mobile menu on resize to desktop
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close menu on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const stateColumns = useMemo(() => {
    const statesWithData = US_STATES;
    const columns = [];
    const itemsPerColumn = Math.ceil(statesWithData.length / 6);

    for (let i = 0; i < statesWithData.length; i += itemsPerColumn) {
      columns.push(statesWithData.slice(i, i + itemsPerColumn));
    }

    return columns;
  }, []);

  return (
    <header className="w-5/6 mx-auto">
      <div className="w-full py-6 border-b border-emerald-950 flex justify-between items-center">

        <Link href="/" className="justify-start text-emerald-950 lg:text-2xl sm:text-base font-bold font-['Inter'] leading-loose">
          National Police Index
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-end items-center gap-8">
          <button
            onClick={() => setIsStatesOpen(!isStatesOpen)}
            className="flex justify-start items-center gap-4 cursor-pointer"
          >
            <span className="text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed">
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
                stroke="currentColor"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link href="/about" className="text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed hover:text-emerald-800">
            About
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-emerald-950 cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {/* Desktop States Dropdown */}
      {mounted && isStatesOpen && (
        <div className="hidden md:block absolute left-0 right-0 w-full shadow-lg z-50 bg-[#F3F3F3]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="w-full flex flex-col justify-start items-start gap-2 mb-6">
              <div className="w-full text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed">
                State
              </div>
              <div className="w-full h-[1px] bg-emerald-950" />
            </div>
            <div className="w-full grid grid-cols-6 gap-8">
              {stateColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-4">
                  {column.map((state) => (
                    <Link
                      key={state.reference}
                      href={`/states/${state.reference.toLowerCase()}`}
                      className="text-emerald-950 text-base font-normal font-['Inter'] leading-normal hover:text-emerald-800 hover:underline"
                      onClick={() => setIsStatesOpen(false)}
                    >
                      {state.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="https://invisible.institute/national-police-index#block-yui_3_17_2_1_1726594221053_11311"
                target="_blank"
                className="text-emerald-950 text-base font-bold font-['Inter'] leading-snug hover:text-emerald-800 hover:underline"
              >
                Why isn&apos;t my state&apos;s data here?
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mounted && isMobileMenuOpen && (
        <div ref={menuRef} className="md:hidden mx-auto fixed inset-0 z-50 bg-[#F3F3F3] ">
          <div className="flex flex-col h-full  rounded-bl-3xl rounded-br-3xl ">
            <div className="flex-1 overflow-y-auto py-6 px-6">
              <nav className="flex flex-col gap-6">
                <div className="pb-4 pr-6 flex justify-between items-center border-b border-b-solid border-emerald-950">

                  <Link href="/" className="justify-start text-emerald-950 lg:text-2xl sm:text-base font-bold font-['Inter'] leading-loose">
                    National Police Index
                  </Link>
                  <button
                    ref={buttonRef}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-emerald-950 cursor-pointer"
                    aria-label="Toggle mobile menu"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      )}
                    </svg>
                  </button>

                </div>
                <Link
                  href="/about"
                  className="text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed hover:text-emerald-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <button
                  onClick={() => setIsStatesOpen(!isStatesOpen)}
                  className="flex items-center flex-row gap-4 text-emerald-950 text-lg font-normal font-['Inter'] leading-relaxed pointer"
                >
                  <span>State Data</span>
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
                      stroke="currentColor"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isStatesOpen && (
                  <div className="pl-4 flex flex-col gap-4">
                    {US_STATES.map((state) => (
                      <Link
                        key={state.reference}
                        href={`/states/${state.reference.toLowerCase()}`}
                        className="text-emerald-950 text-base font-normal font-['Inter'] leading-normal hover:text-emerald-800"
                        onClick={() => {
                          setIsStatesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {state.name}
                      </Link>
                    ))}

                    <Link
                      href="https://invisible.institute/national-police-index#block-yui_3_17_2_1_1726594221053_11311"
                      className="text-emerald-950 text-base font-bold font-['Inter'] leading-snug hover:text-emerald-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Why isn&apos;t my state&apos;s data here?
                    </Link>
                  </div>
                )}

              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
