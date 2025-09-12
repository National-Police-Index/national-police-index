import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const generateSitemap = async () => {
  return Promise.resolve();
};


export const generateSitemapHttp = onRequest(async (req, res) => {
  try {
    await generateSitemap();
    res.status(200).send({
      success: true,
      message: "Sitemap generated successfully"
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send({
      success: false,
      message: "Error generating sitemap"
    });
  }
});

admin.initializeApp();


export const generateSitemapScheduled = onSchedule({
  retryCount: 3,
  schedule: "0 0 1 * *",
  timeZone: "UTC",
}, async () => {
  try {
    await generateSitemap();
    return;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  }
});
