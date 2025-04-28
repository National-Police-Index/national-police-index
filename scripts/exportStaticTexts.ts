import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as fs from 'fs';
import * as path from 'path';

interface StaticText {
  id: string;
  text: string;
  page: string;
  section: string;
}

async function exportStaticTexts() {
  try {
    console.log('Starting export of static texts...');
    
    // Get all static texts
    const textsRef = collection(db, 'static_texts');
    const snapshot = await getDocs(textsRef);
    
    const texts: StaticText[] = [];
    snapshot.forEach((doc) => {
      texts.push({
        id: doc.id,
        ...doc.data() as Omit<StaticText, 'id'>
      });
    });

    // Sort texts by page and section for better readability
    texts.sort((a, b) => {
      if (a.page !== b.page) return a.page.localeCompare(b.page);
      return a.section.localeCompare(b.section);
    });

    // Create exports directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(exportDir, `static-texts-${timestamp}.json`);

    // Write to file
    fs.writeFileSync(
      filename,
      JSON.stringify({ texts, exportedAt: new Date().toISOString() }, null, 2)
    );

    console.log(`Successfully exported ${texts.length} texts to ${filename}`);
  } catch (error) {
    console.error('Error exporting static texts:', error);
    process.exit(1);
  }
}

exportStaticTexts().catch(console.error);
