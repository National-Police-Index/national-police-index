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

- **Formatting**:
```bash
npm run format
```
Runs BiomeJS to check for code quality issues

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
