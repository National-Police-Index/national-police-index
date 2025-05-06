'use client';
import StateFulltextSearch from './StateFulltextSearch';
import StatePageClient from './StatePageClient';

import { Suspense } from 'react';

export default function StatePage() {
  return (

    <Suspense fallback={<div>Loading...</div>}>
      {false && <StatePageClient />}
      <StateFulltextSearch />
    </Suspense>
  );
}

