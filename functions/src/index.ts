import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateSitemap } from '../../scripts/generateSitemap';

admin.initializeApp();

// Run every first day of the month at 00:00 UTC
export const generateSitemapScheduled = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      await generateSitemap();
      console.log('Sitemap generated successfully via scheduled function');
      return null;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  });
