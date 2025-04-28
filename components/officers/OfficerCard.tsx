'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PoliceOfficer } from '@/types';
import { useStaticText } from '@/hooks/useStaticText';
import styles from './OfficeCard.module.scss';

interface OfficerCardProps {
  officer: PoliceOfficer;
}

export default function OfficerCard({ officer }: OfficerCardProps) {
  const { getText } = useStaticText('officer-card');
  const [expanded, setExpanded] = useState(false);
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch {
      return 'N/A';
    }
  };

  const cardContent = useRef<HTMLDivElement>(null);

  const [more, setMore] = useState(false);
  const [moreActive, setMoreActive] = useState(false);

  useEffect(() => {
    // console log scroll height of cardContent
    if (cardContent.current) {
      const scrollHeight = cardContent.current.scrollHeight;
      const clientHeight = cardContent.current.clientHeight;
      if (scrollHeight > clientHeight) {
        setMore(true);
      }
    }
  }, []);

  const fullName = officer.full_name || officer.first_name + ' ' + officer.last_name;

  const onMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMoreActive(!moreActive);
  }


  return (
    <Link
      href={`/officers/${officer.person_nbr}`}
      className={`group flex w-full max-w-sm ${styles.officerCard} ${moreActive ? styles.moreActive : ''}`}
    >
      <div className="w-[5%] min-w-[1.5rem] bg-[#2F5E50] rounded-tl-2xl rounded-bl-2xl" />
      <div className={`flex-1 flex flex-col justify-start items-start ${styles.cardContent}`}>
        <div ref={cardContent}>
          <div className={styles.name}>
            {fullName}
          </div>
          <hr />
          <div className={styles.details}>
            <p className="text-sm text-gray-600">{getText('uid-label', 'UID')}: {officer.person_nbr}</p>
            <p className="text-sm text-gray-600">{getText('agency-label', 'Agency')}: {officer.agency_name}</p>
            <p className="text-sm text-gray-600">{getText('position-label', 'Position')}: {officer.position || getText('position-not-specified', 'Not specified')}</p>
            <div className={styles.dates}>
              <div>{formatDate(officer.start_date)}</div>
              <div>{formatDate(officer.end_date)}</div>
            </div>
          </div>
          {more && (
            <button
              className={styles.more}
              onClick={onMoreClick}
            >
              <div>More</div>
              <div data-svg-wrapper>
                <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 0.759521L6.88384 4.87568C6.39773 5.36179 5.60227 5.36179 5.11616 4.87568L1 0.759521" stroke="#4F8C7E" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
