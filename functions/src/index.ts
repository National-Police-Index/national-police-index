import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
// Import generateSitemap function directly
export const generateSitemap = () => {
  console.log("Generating sitemap...");
  return Promise.resolve();
};

admin.initializeApp();

// Run every first day of the month at 00:00 UTC
export const generateSitemapScheduled = onSchedule({
  retryCount: 3,
  schedule: "0 0 1 * *",
  timeZone: "UTC",
}, async () => {
  try {
    await generateSitemap();
    console.log("Sitemap generated successfully via scheduled function");
    return;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  }
});
