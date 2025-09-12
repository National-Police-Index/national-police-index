import * as admin from 'firebase-admin';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { US_STATES } from '../constants/states.js';
import { loadServiceAccount } from '../utils/loadServiceAccount.js';

interface State {
  name: string;
  abbreviation: string;
  hasData?: boolean;
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://nationalpoliceindex.org';

async function initializeFirebase() {
  if (!admin.apps.length) {
    const serviceAccount = await loadServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin.firestore();
}

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

async function generateSitemap() {
  const db = await initializeFirebase();
  try {

    const officersSnapshot = await db.collectionGroup('db_launch').get();
    const officers = officersSnapshot.docs.map(doc => ({
      id: doc.id,
      personNbr: doc.data().person_nbr,
      lastModified: doc.updateTime.toDate()
    }));


    const urls: SitemapUrl[] = [

      {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },

      ...US_STATES
        .filter((state: State) => state.hasData)
        .map((state: State) => ({
          loc: `${baseUrl}/states/${state.abbreviation.toLowerCase()}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: '0.8'
        })),

      ...officers.map(officer => ({
        loc: `${baseUrl}/officers/${officer.personNbr}`,
        lastmod: officer.lastModified.toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      }))
    ];


    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http:
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;


    await fs.writeFile(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}


if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { generateSitemap };
