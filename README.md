# National Police Index

A web application for searching and exploring police officer employment records, certification status, and disciplinary actions across the United States.

## Features

- Search police officers by name, badge number, or agency
- View detailed officer profiles and employment history
- State-specific statistics and analytics
- Responsive design with modern UI/UX
- Real-time data updates

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: SCSS Modules + Tailwind CSS
- **Hosting**: Firebase Hosting
- **Analytics**: Firebase Analytics

## Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore and Authentication enabled

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/national-police-index.git
cd national-police-index
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your Firebase configuration.

## Available Scripts

- **Development server**:
```bash
npm run dev
```
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

- **Build**:
```bash
npm run build
```
Creates an optimized production build

- **Production server**:
```bash
npm start
```
Runs the app in production mode

- **Linting**:
```bash
npm run lint
```
Runs ESLint to check for code quality issues

## Project Structure

```
├── app/                # Next.js app directory
├── components/         # Reusable React components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and Firebase setup
├── public/            # Static assets
└── styles/            # SCSS styles
    ├── abstracts/     # Variables and mixins
    ├── base/          # Base styles
    ├── components/    # Component styles
    ├── layout/        # Layout styles
    └── pages/         # Page-specific styles
```

## Updating State Data

When you update the database with new data for a specific state, you need to run several scripts in sequence to ensure data integrity, search functionality, and statistics are properly updated. The checklist below covers every step for uploading a new state or re-uploading an existing one; the commands for each step follow it.

### Checklist

- [ ] **Before you start:** the state has `hasData: true` in `constants/states.ts` (step 3 rejects states without it, and the site only lists states that have it).
- [ ] **California re-upload only:** set `CA_FAST_SEARCH_ENABLED = false` in `lib/officerSearch.ts` and deploy, since California search returns nothing until step 4 has run.
- [ ] **1. Normalize names:** fills in `full_name` where it's missing.
- [ ] **2. Build search tokens:** writes `searchQueries`, the words name search matches on.
- [ ] **3. Normalize dates:** adds `start_date_iso` / `end_date_iso` for the date filters.
- [ ] **4. California only, build search prefixes:** writes `search_prefixes`, which California search reads for partial-word matching.
- [ ] **5. Refresh statistics:** the state's totals, then its agencies' totals.
- [ ] **6. Verify search tokens:** every record has well-formed tokens (0 missing, 0 old-format).
- [ ] **7. Verify search:** real officers from the state are found the ways people type their names (must end `ALL PASS`).
- [ ] **8. Spot-check:** `statistics_per_state/<state>` shows today's `last_updated` and a sensible `Total Officers`, and a few officers come up in the UI.
- [ ] **California re-upload only:** set `CA_FAST_SEARCH_ENABLED = true` again and deploy.

### Commands

Set the state once, as the full, lower-cased name stored in each record's `state` field (e.g. `minnesota`, `new-mexico`). Every script processes only the state you pass it and writes to production Firestore through the Firebase Admin SDK, using the service account in `firebase-service-account.json`. Times are from Minnesota (49,168 records); California (about 505k records) takes roughly ten times longer.

```bash
STATE=minnesota

# 1. Normalize names (about 1 min; a no-op when the upload already has full_name)
npx tsx scripts/normalizeStateData.ts $STATE

# 2. Build search tokens (about 5 min)
npx tsx scripts/addSearchQueriesByState.ts $STATE

# 3. Normalize dates (about 4 min)
npx tsx scripts/normalizeDatesByState.ts $STATE

# (California only, run here: npx tsx scripts/addSearchPrefixesByState.ts california, about 1 hour)

# 5. Refresh statistics (about 2 min, then about 6 min)
npm run generate-stats -- $STATE
npm run generate-stats-agencies -- $STATE   # ALWAYS pass the state: without it this runs every state (24+ hours)

# 6. Verify search tokens
npx tsx benchmark/verifyTokenCoverage.ts $STATE --strict

# 7. Verify search, on the fixed sample and on a fresh random one
npx tsx benchmark/verifySearchRecall.ts $STATE
npx tsx benchmark/verifySearchRecall.ts $STATE --seed=random
```

**Re-running is safe.** Every step can be re-run at any time and simply redoes its writes. There's nothing to delete first. Steps 1–3 keep a progress file in the repo root (git-ignored), but only so an interrupted run of step 1 can pick up where it stopped; it prints `Resuming an interrupted run…`, and `--fresh` forces a restart.

**Known limitations:**
- `scripts/normalizeDatesByState.ts` refuses `kansas` and `arizona`.
- Agency statistics are keyed by agency name alone, so same-named agencies in different states share one `statistics_per_agency` record.

### Search test suites

The search tests are state-agnostic: every state, California included, runs the same suites. Every pull request runs them in CI (`.github/workflows/search-tests.yml`, about 10 min): the token contract below, then search recall across every state on a fresh random sample. The job summary shows the seed for replaying a failure. CI only covers code changes; data uploads have no PR, so steps 6–7 above are still how an upload is verified. Besides steps 6–7:

- `npx tsx benchmark/verifySearchTokens.ts`: offline (no Firestore). Checks that the tokens the pipeline stores agree with the search filter, on real record shapes from production. Run it after changing the tokenizer in `lib/officerSearch.ts`.
- `npx tsx benchmark/verifySearchRecall.ts` with no state runs across every state with data, plus the named regression queries. Results are saved to `benchmark/results/` (git-ignored); compare two runs with `--compare=<earlier.json>`. A failing `--seed=random` run prints its seed; replay it with `--seed=<n>`.

## Firebase Deployment

1. Login to Firebase:
```bash
firebase login
```

2. Initialize Firebase project:
```bash
firebase init
```
Select the following options:
- Hosting
- Use an existing project
- Select your Firebase project
- Use `out` as the public directory
- Configure as single-page app: No
- Set up automatic builds: No

3. Build the Next.js app:
```bash
npm run build
```

4. Export the static files:
```bash
next export
```

5. Deploy to Firebase:
```bash
firebase deploy
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
