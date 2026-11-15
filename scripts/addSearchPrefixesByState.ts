// Writes `search_prefixes`, the field the California fast search path in
// hooks/useOfficersByUid.ts queries; re-run after any re-upload or CA search
// returns nothing. Every indexed prefix must pass the client filter
// (matchesAllTerms in lib/officerSearch.ts) — benchmark/verifySearchTokens.ts
// asserts it, and benchmark/verifyTokenCoverage.ts checks the stored data.
//
// Usage: npx tsx scripts/addSearchPrefixesByState.ts <state> [--dry-run]
import * as admin from 'firebase-admin';
import { loadServiceAccount } from '../utils/loadServiceAccount';

type DocumentData = admin.firestore.DocumentData;
type QueryDocumentSnapshot<T = DocumentData> =
  admin.firestore.QueryDocumentSnapshot<T>;

interface OfficerDocument extends DocumentData {
  first_name?: string;
  last_name?: string;
  search_prefixes?: string[];
}

const US_STATES = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire',
  'new-jersey', 'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west-virginia',
  'wisconsin', 'wyoming'
];

export const MIN_PREFIX_LENGTH = 2;

const BATCH_SIZE = 500;   // Firestore's max writes per batch
const PAGE_SIZE = 1000;
const LOG_EVERY = 25000;

/** Every prefix (length >= MIN_PREFIX_LENGTH) of every whitespace token in the name. */
export function searchPrefixesFor(firstName: string, lastName: string): string[] {
  const tokens = `${firstName} ${lastName}`
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const prefixes = new Set<string>();
  for (const token of tokens) {
    for (let len = MIN_PREFIX_LENGTH; len <= token.length; len++) {
      prefixes.add(token.slice(0, len));
    }
  }
  return [...prefixes];
}

function alreadyCorrect(existing: string[] | undefined, wanted: string[]): boolean {
  if (!Array.isArray(existing) || existing.length !== wanted.length) return false;
  const set = new Set(existing);
  return wanted.every(p => set.has(p));
}

// No progress file by design: the write is idempotent, so recovery is just
// running it again, and a resume guard would only risk no-oping a re-upload.
async function addSearchPrefixes(
  db: admin.firestore.Firestore,
  state: string,
  dryRun: boolean
): Promise<void> {
  const startedAt = Date.now();
  let processed = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;
  let lastDoc: QueryDocumentSnapshot<OfficerDocument> | null = null;

  const elapsed = () => ((Date.now() - startedAt) / 60000).toFixed(1);

  for (;;) {
    // Under the admin SDK where() must precede startAfter().
    let pageQuery: admin.firestore.Query = db
      .collectionGroup('db_launch')
      .where('state', '==', state);
    if (lastDoc) pageQuery = pageQuery.startAfter(lastDoc);

    const page = await pageQuery.limit(PAGE_SIZE).get();
    if (page.empty) break;

    let batch = db.batch();
    let pending = 0;

    for (const doc of page.docs as QueryDocumentSnapshot<OfficerDocument>[]) {
      const { first_name = '', last_name = '', search_prefixes } = doc.data();
      processed++;

      if (!first_name && !last_name) {
        skipped++;
        continue;
      }

      const prefixes = searchPrefixesFor(first_name, last_name);
      if (alreadyCorrect(search_prefixes, prefixes)) {
        unchanged++;
        continue;
      }
      updated++;

      if (dryRun) continue;
      batch.update(doc.ref, { search_prefixes: prefixes });
      if (++pending >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        pending = 0;
      }
    }

    if (pending > 0) await batch.commit();

    if (processed % LOG_EVERY === 0) {
      console.log(`[${state}] ${processed} processed, ${updated} updated, ${unchanged} unchanged, ${skipped} skipped (${elapsed()} min)`);
    }

    if (page.size < PAGE_SIZE) break;
    lastDoc = page.docs[page.size - 1] as QueryDocumentSnapshot<OfficerDocument>;
  }

  console.log(
    `\n${state}: ${processed} processed, ${updated} updated, ${unchanged} unchanged, ` +
    `${skipped} skipped (no name) in ${elapsed()} min` +
    (dryRun ? '  [DRY RUN — nothing written]' : '')
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const state = args.find(a => !a.startsWith('--'))?.toLowerCase();
  const dryRun = args.includes('--dry-run');

  // No all-states default: this is ~40 min per state.
  if (!state || !US_STATES.includes(state)) {
    console.error(`Usage: npx tsx scripts/addSearchPrefixesByState.ts <state> [--dry-run]`);
    console.error(state ? `Unknown state: ${state}` : 'No state given.');
    process.exit(1);
  }

  const serviceAccount = await loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
  await addSearchPrefixes(admin.firestore(), state, dryRun);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
