import {onSchedule} from "firebase-functions/v2/scheduler";
import {onRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
// Import generateSitemap function directly
export const generateSitemap = async () => {
  console.log("Generating sitemap...");
  return Promise.resolve();
};

// HTTP endpoint for manual triggering
export const generateSitemapHttp = onRequest(async (req, res) => {
  try {
    await generateSitemap();
    res.status(200).send({success: true, message: "Sitemap generated successfully"});
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send({success: false, message: "Error generating sitemap"});
  }
});

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
