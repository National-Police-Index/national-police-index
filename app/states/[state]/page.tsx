'use client';
import StatePageClient from './StatePageClient';

import { Suspense } from 'react';

export default function StatePage() {
  return (

    <Suspense fallback={<div>Loading...</div>}>
      <StatePageClient />
    </Suspense>
  );
}

