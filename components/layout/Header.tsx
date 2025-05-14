'use client';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { useStaticText } from '@/hooks/useStaticText';
import { US_STATES } from '@/constants/states';

export default function Header() {
  const { getText } = useStaticText('header');
  const [mounted, setMounted] = useState(false);
  const [isStatesOpen, setIsStatesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    const body = document.body;
    if (isMobileMenuOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const stateColumns = useMemo(() => {
    const statesWithData = US_STATES.filter(state => state.hasData);
    const columns = [];
    const itemsPerColumn = Math.ceil(statesWithData.length / 7);

    for (let i = 0; i < statesWithData.length; i += itemsPerColumn) {
      columns.push(statesWithData.slice(i, i + itemsPerColumn));
    }

    return columns;
  }, []);

  // can you use getBoundingClientRect() to check if the header is overlapping/intersecting the div element matching the class*="_mapSection_" and add/remove the class styles.noBorderBottom to the header and NOT the intersection observer

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const mapSection = document.querySelector('div[class*="_mapSection_"]');
        if (mapSection) {
          const mapSectionRect = mapSection.getBoundingClientRect();
          if (headerRect.bottom > mapSectionRect.top) {
            headerRef.current.classList.add(styles.noBorderBottom);
          } else {
            headerRef.current.classList.remove(styles.noBorderBottom);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header ref={headerRef} className={`mx-auto ${styles.header} ${isMobileMenuOpen ? styles.headerOpen : ''}`}>
      <div className={`container-a w-full py-6 flex justify-between items-center ${styles.headerContent} ${isStatesOpen ? styles.headerContentOpen : ''}`}>

        <Link href="/" className={`justify-start text-[#122823] font-bold font-['Inter'] p-2 m-[-8px] ${styles.siteTitle}`}>
          {getText('site-name', 'National Police Index')}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-end items-center gap-8">
          <button
            onClick={() => {
              if (!isStatesOpen) {
                setIsStatesOpen(true);
                headerRef.current?.classList.add(styles.showMenu);
              } else {
                headerRef.current?.classList.remove(styles.showMenu);
                setTimeout(() => {
                  setIsStatesOpen(false);
                }, 100)
              }
            }}
            className="flex justify-start items-center gap-4 cursor-pointer"
          >
            <span className="text-[#122823] text-lg font-normal font-['Inter'] leading-relaxed">
              {getText('nav-states', 'States')}
            </span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transform transition-transform ${isStatesOpen ? 'rotate-180' : ''}`}>
              <path d="M11 1.75952L6.88384 5.87568C6.39773 6.36179 5.60227 6.36179 5.11616 5.87568L1 1.75952" stroke="#122823" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Link href="/about" className="text-[#122823] text-lg font-normal font-['Inter'] leading-relaxed hover:text-[#2F5E50]">
            {getText('nav-about', 'About')}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 m-[-8px] text-[#122823] cursor-pointer"
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
        <div className={`md:block absolute left-0 right-0 w-full z-50 ${styles.mainMenu}`}>
          <div className="container-a mx-auto pb-14 relative">
            <div className={`w-full flex flex-col justify-start items-start gap-2 mb-6 ${styles.mainMenuHeader}`}>
              <div className="w-full text-lg font-normal font-['Inter'] leading-[1.5]">
                State
              </div>
              <div className="w-full h-[1px] bg-[#2F5E50]" />
            </div>
            <div className="w-full grid grid-cols-7 gap-8">
              {stateColumns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-2">
                  {column.map((state) => (
                    <Link
                      key={state.reference}
                      href={`/states/${state.reference.toLowerCase()}`}
                      className="text-[#122823] text-base font-normal font-['Inter'] leading-[1.5] hover:text-[#2F5E50] hover:underline"
                      onClick={() => setIsStatesOpen(false)}
                    >
                      {state.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="https://invisible.institute/national-police-index#block-yui_3_17_2_1_1726594221053_11311"
                target="_blank"
                className="text-[#122823] text-base font-bold font-['Inter'] leading-snug hover:text-[#2F5E50] hover:underline"
              >
                Why isn&apos;t my state&apos;s data here?
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mounted && isMobileMenuOpen && (
        <div ref={menuRef} className={`container-a py-6 md:hidden mx-auto inset-0 z-50 ${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''} ${isStatesOpen ? styles.mobileStatesOpen : ''}`}>
          <div className="flex flex-col h-full relative">
            <div className="">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/about"
                  className="text-[#122823] font-normal font-['Inter'] leading-relaxed hover:text-[#2F5E50]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <button
                  onClick={() => setIsStatesOpen(!isStatesOpen)}
                  className="flex items-center flex-row gap-4 text-[#122823] font-normal leading-relaxed font-['Inter'] cursor-pointer"
                >
                  <span>State Data</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transform transition-transform ${isStatesOpen ? 'rotate-180' : ''}`}>
                    <path d="M11 1.75952L6.88384 5.87568C6.39773 6.36179 5.60227 6.36179 5.11616 5.87568L1 1.75952" stroke="#122823" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isStatesOpen && (
                  <div className="flex flex-col gap-2 pb-8">
                    {US_STATES.map((state) => (
                      <Link
                        key={state.reference}
                        href={`/states/${state.reference.toLowerCase()}`}
                        className="text-[#122823] text-[14px] font-normal font-['Inter'] leading-[1.5] hover:text-[#2F5E50]"
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
                      className="text-[#122823] text-[14px] font-bold font-['Inter'] leading-snug hover:text-[#2F5E50] pt-2"
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
