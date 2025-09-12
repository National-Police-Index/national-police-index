import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as fs from 'fs';
import * as path from 'path';

interface StaticText {
  id: string;
  text: string;
  page: string;
  section: string;
}

interface ExportFile {
  texts: StaticText[];
  exportedAt: string;
}

async function importStaticTexts(filename: string, clearExisting: boolean = false) {
  try {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Import file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const importData = JSON.parse(fileContent) as ExportFile;

    const textsRef = collection(db, 'static_texts');


    if (clearExisting) {
      const snapshot = await getDocs(textsRef);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }


    let imported = 0;
    for (const text of importData.texts) {
      await setDoc(doc(textsRef, text.id), {
        text: text.text,
        page: text.page,
        section: text.section
      });
      imported++;
      if (imported % 10 === 0) {
        console.log(`Imported ${imported} texts...`);
      }
    }

  } catch (error) {
    console.error('Error importing static texts:', error);
    process.exit(1);
  }
}


const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide the import file path as an argument');
  console.error('Usage: npx ts-node scripts/importStaticTexts.ts <filepath> [--clear]');
  process.exit(1);
}

const filename = args[0];
const clearExisting = args.includes('--clear');

importStaticTexts(filename, clearExisting).catch(console.error);
