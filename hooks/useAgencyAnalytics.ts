"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackAgencyView, trackPageView } from "@/lib/analytics";

interface AgencyData {
  agencyId: string;
  agencyName: string;
  state: string;
  officerCount?: number;
}

export const useAgencyAnalytics = (agencyData: AgencyData | null) => {
  const pathname = usePathname();

  useEffect(() => {
    if (agencyData && typeof window !== "undefined") {
      const { agencyId, agencyName, state, officerCount } = agencyData;

      // Track agency profile view with state information
      trackAgencyView(agencyId, agencyName, state, officerCount, "direct_url");

      // Track enhanced page view
      trackPageView(
        window.location.href,
        document.title,
        "agency",
        state,
        agencyName,
      );
    }
  }, [agencyData, pathname]);

  return {
    trackAgencyInteraction: (action: string, details?: Record<string, any>) => {
      if (agencyData) {
        trackAgencyView(
          agencyData.agencyId,
          agencyData.agencyName,
          agencyData.state,
          agencyData.officerCount,
          action,
        );
      }
    },
  };
};
