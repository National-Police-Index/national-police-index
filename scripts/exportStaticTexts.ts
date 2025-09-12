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

    const textsRef = collection(db, 'static_texts');
    const snapshot = await getDocs(textsRef);

    const texts: StaticText[] = [];
    snapshot.forEach((doc) => {
      texts.push({
        id: doc.id,
        ...doc.data() as Omit<StaticText, 'id'>
      });
    });


    texts.sort((a, b) => {
      if (a.page !== b.page) return a.page.localeCompare(b.page);
      return a.section.localeCompare(b.section);
    });


    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }


    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(exportDir, `static-texts-${timestamp}.json`);


    fs.writeFileSync(
      filename,
      JSON.stringify({ texts, exportedAt: new Date().toISOString() }, null, 2)
    );

  } catch (error) {
    console.error('Error exporting static texts:', error);
    process.exit(1);
  }
}

exportStaticTexts().catch(console.error);
