import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { 
  trackPageView, 
  trackEngagementMilestone, 
  trackConversion,
  GA_TRACKING_ID 
} from '@/lib/analytics';

export function useAnalytics() {
  const pathname = usePathname();

  // Track page views automatically
  useEffect(() => {
    if (GA_TRACKING_ID && typeof window !== 'undefined') {
      const url = `${pathname}${window.location.search}`;
      trackPageView(url, document.title);
    }
  }, [pathname]);

  // Track engagement milestones
  useEffect(() => {
    let sessionStartTime = Date.now();
    let engagementTracked = false;

    const trackEngagement = () => {
      const timeSpent = Date.now() - sessionStartTime;
      
      // Track 30 second milestone
      if (timeSpent > 30000 && !engagementTracked) {
        trackEngagementMilestone('30_seconds', 30);
        engagementTracked = true;
      }
      
      // Track 2 minute milestone (conversion)
      if (timeSpent > 120000) {
        trackConversion('extended_session', Math.floor(timeSpent / 1000));
      }
    };

    const interval = setInterval(trackEngagement, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);

  // Return tracking functions for manual use
  const trackCustomEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
      window.gtag('event', eventName, parameters);
    }
  }, []);

  return {
    trackCustomEvent,
    isAnalyticsEnabled: !!GA_TRACKING_ID,
  };
}
