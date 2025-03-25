import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';
import { US_STATES } from '../constants/states';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const baseUrl = 'https://nationalpoliceindex.org'; // Replace with your actual domain

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

async function generateSitemap() {
  try {
    // Get all officer IDs
    const officersSnapshot = await db.collection('officers').get();
    const officers = officersSnapshot.docs.map(doc => ({
      id: doc.id,
      lastModified: doc.updateTime.toDate()
    }));

    // Create sitemap entries
    const urls: SitemapUrl[] = [
      // Home page
      {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      // State pages
      ...US_STATES
        .filter(state => state.hasData)
        .map(state => ({
          loc: `${baseUrl}/states/${state.abbreviation.toLowerCase()}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.8'
        })),
      // Officer pages
      ...officers.map(officer => ({
        loc: `${baseUrl}/officers/${officer.id}`,
        lastmod: officer.lastModified.toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      }))
    ];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write sitemap to public directory
    await fs.writeFile(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully');

  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  generateSitemap()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { generateSitemap };
