'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackAgencyView, trackPageView } from '@/lib/analytics';

interface AgencyData {
  agencyId: string;
  agencyName: string;
  state: string;
  officerCount?: number;
}

export const useAgencyAnalytics = (agencyData: AgencyData | null) => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (agencyData && typeof window !== 'undefined') {
        const { agencyId, agencyName, state, officerCount } = agencyData;

        // Track agency profile view with state information
        trackAgencyView(
          agencyId,
          agencyName,
          state,
          officerCount,
          'direct_url'
        );

        // Track enhanced page view
        trackPageView(
          window.location.href,
          document.title,
          'agency',
          state,
          agencyName
        );
      }
    } catch {
      // Silently ignore analytics errors (e.g., blocked by ad blockers)
    }
  }, [agencyData, pathname]);

  return {
    trackAgencyInteraction: (action: string) => {
      try {
        if (agencyData) {
          trackAgencyView(
            agencyData.agencyId,
            agencyData.agencyName,
            agencyData.state,
            agencyData.officerCount,
            action
          );
        }
      } catch {
        // Silently ignore analytics errors (e.g., blocked by ad blockers)
      }
    }
  };
};
