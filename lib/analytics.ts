// Google Analytics 4 Configuration and Event Tracking
// For National Police Index Application

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) {
    console.warn('Google Analytics tracking ID not found');
    return;
  }
};

// Generic event tracking function
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters,
    });
  }
};

// Specific tracking functions for National Police Index

// Track state searches
export const trackStateSearch = (state: string, hasResults: boolean, resultCount?: number) => {
  trackEvent('search_state', 'search', state, resultCount, {
    has_results: hasResults,
    search_type: 'state_search',
  });
};

// Track officer profile views
export const trackOfficerView = (officerId: string, state: string, source?: string) => {
  trackEvent('view_officer_profile', 'engagement', `${state}_${officerId}`, undefined, {
    officer_id: officerId,
    state: state,
    source: source || 'search_results',
  });
};

// Track map interactions
export const trackMapInteraction = (state: string, action: 'click' | 'hover') => {
  trackEvent('map_interaction', 'engagement', state, undefined, {
    interaction_type: action,
    component: 'us_map',
  });
};

// Track search filters usage
export const trackFilterUsage = (filterType: string, filterValue: string, state: string) => {
  trackEvent('filter_applied', 'search', `${filterType}_${filterValue}`, undefined, {
    filter_type: filterType,
    filter_value: filterValue,
    state: state,
  });
};

// Track pagination
export const trackPagination = (page: number, state: string, totalResults?: number) => {
  trackEvent('pagination_click', 'navigation', `page_${page}`, page, {
    state: state,
    total_results: totalResults,
  });
};

// Track search performance
export const trackSearchPerformance = (
  searchTerm: string,
  resultCount: number,
  loadTime: number,
  state: string
) => {
  trackEvent('search_performance', 'performance', searchTerm, loadTime, {
    result_count: resultCount,
    load_time_ms: loadTime,
    state: state,
  });
};

// Track user engagement milestones
export const trackEngagementMilestone = (milestone: string, value?: number) => {
  trackEvent('engagement_milestone', 'engagement', milestone, value, {
    milestone_type: milestone,
  });
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText?: string) => {
  trackEvent('external_link_click', 'outbound', url, undefined, {
    link_text: linkText,
    destination: url,
  });
};

// Track errors
export const trackError = (errorType: string, errorMessage: string, page?: string) => {
  trackEvent('error_occurred', 'error', errorType, undefined, {
    error_message: errorMessage,
    page: page || window.location.pathname,
  });
};

// Enhanced ecommerce-style tracking for "conversions"
export const trackConversion = (conversionType: 'successful_search' | 'profile_engagement' | 'extended_session', value?: number) => {
  trackEvent('conversion', 'conversion', conversionType, value, {
    conversion_type: conversionType,
  });
};

// Page view tracking (automatic with GA4, but useful for SPA navigation)
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
      page_title: title,
    });
  }
};
