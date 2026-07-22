'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackOfficerView, trackPageView } from '@/lib/analytics';

interface OfficerData {
  personNbr: string;
  fullName: string;
  state: string;
  agencyName?: string;
}

export const useOfficerAnalytics = (officerData: OfficerData | null) => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (officerData && typeof window !== 'undefined') {
        const { personNbr, fullName, state, agencyName } = officerData;

        // Track officer profile view with detailed location info
        trackOfficerView(
          personNbr,
          state,
          agencyName,
          fullName,
          'direct_url'
        );

        // Track enhanced page view
        trackPageView(
          window.location.href,
          document.title,
          'officer',
          state,
          agencyName,
          personNbr
        );
      }
    } catch {
      // Silently ignore analytics errors (e.g., blocked by ad blockers)
    }
  }, [officerData, pathname]);

  return {
    trackOfficerInteraction: (action: string) => {
      try {
        if (officerData) {
          trackOfficerView(
            officerData.personNbr,
            officerData.state,
            officerData.agencyName,
            officerData.fullName,
            action
          );
        }
      } catch {
        // Silently ignore analytics errors (e.g., blocked by ad blockers)
      }
    }
  };
};
