import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all officers
  const officersRef = collection(db, 'db_launch');
  const officersSnap = await getDocs(officersRef);
  
  // Get unique states
  const states = new Set<string>();
  officersSnap.docs.forEach(doc => {
    const state = doc.data().state;
    if (state) states.add(state);
  });

  // Base URLs
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: 'https://nationalpoliceindex.org',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://nationalpoliceindex.org/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://nationalpoliceindex.org/states',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Add state URLs
  const stateUrls = Array.from(states).map(state => ({
    url: `https://nationalpoliceindex.org/states/${state.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Add officer URLs
  const officerUrls = officersSnap.docs.map(doc => ({
    url: `https://nationalpoliceindex.org/officers/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...baseUrls, ...stateUrls, ...officerUrls];
}
