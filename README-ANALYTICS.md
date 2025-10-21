# Google Analytics 4 Setup Guide

## Environment Variables Required

Add the following environment variable to your `.env.local` file:

```bash
# Google Analytics 4 Tracking ID
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

## How to Get Your GA4 Tracking ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use an existing one
3. Go to Admin > Property Settings > Data Streams
4. Select your web data stream
5. Copy the "Measurement ID" (starts with G-)

## Events Being Tracked

### Search Events
- **State Search**: When users search for officers in a specific state
- **Search Performance**: Load times and result counts
- **Filter Usage**: When users apply filters (agency, dates, etc.)

### User Engagement
- **Officer Profile Views**: When users click on officer cards
- **Map Interactions**: Clicks and hovers on the US map
- **Pagination**: Page navigation and page size changes

### Conversions
- **Successful Search**: Search with results > 0
- **Profile Engagement**: Extended time viewing officer profiles
- **Extended Session**: Sessions longer than 2 minutes

## Analytics Functions Available

All analytics functions are available in `/lib/analytics.ts`:

- `trackStateSearch(state, hasResults, resultCount)`
- `trackOfficerView(officerId, state, source)`
- `trackMapInteraction(state, action)`
- `trackFilterUsage(filterType, filterValue, state)`
- `trackPagination(page, state, totalResults)`
- `trackConversion(conversionType, value)`

## Testing Analytics

1. Set up your GA4 property
2. Add the tracking ID to your environment variables
3. Deploy or run locally
4. Use GA4 DebugView to see real-time events
5. Check GA4 Reports after 24-48 hours for processed data

## Privacy Considerations

- No personally identifiable information (PII) is tracked
- Officer IDs are anonymized document IDs
- IP addresses are automatically anonymized by GA4
- Users can opt-out using browser settings or ad blockers
