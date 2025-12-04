"use client";

import { Suspense } from "react";
import StatePageClient from "./StatePageClient";

export default function StatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatePageClient />
    </Suspense>
  );
}
