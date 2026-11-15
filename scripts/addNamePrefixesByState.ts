// Writes `name_prefixes`, the field officer name search queries
// (lib/officerSearch.ts): every prefix of every name word, built by the search
// module's own namePrefixes(), so the stored field and the search filter
// can't drift apart.
//
// Run it for a state after every upload or re-upload: a record without
// name_prefixes can't be found by name. It writes ONLY name_prefixes (no other
// field is read-modified-written), skips records whose name_prefixes is
// already correct, and is safe to re-run at any time. No progress file: a
// re-run just checks every record again.
//
// Usage: npx tsx scripts/addNamePrefixesByState.ts <state> [--dry-run]
// Exit:  0 done, 1 bad arguments or any write failed.
import * as admin from 'firebase-admin';
import { loadServiceAccount } from '../utils/loadServiceAccount';
import { namePrefixes, NAME_PREFIX_FIELD } from '../lib/officerSearch';
import { US_STATES } from '../constants/states';

const PAGE_SIZE = 2000;
const LOG_EVERY = 20000;

const sameSet = (a: unknown, b: string[]) =>
  Array.isArray(a) && a.length === b.length && new Set(a).size === b.length && b.every((x) => a.includes(x));

async function addNamePrefixes(db: admin.firestore.Firestore, state: string, dryRun: boolean): Promise<boolean> {
  const startedAt = Date.now();
  const elapsed = () => ((Date.now() - startedAt) / 60000).toFixed(1);
  let processed = 0, updated = 0, unchanged = 0, skipped = 0, failed = 0;

  // BulkWriter batches, parallelises and retries writes, with Firestore's
  // ramp-up throttling built in.
  const writer = db.bulkWriter();
  writer.onWriteError((err) => {
    if (err.failedAttempts < 5) return true;
    failed++;
    console.error(`  write failed for ${err.documentRef.path}: ${err.message}`);
    return false;
  });

  let last: admin.firestore.QueryDocumentSnapshot | null = null;
  for (;;) {
    let q = db
      .collectionGroup('db_launch')
      .where('state', '==', state)
      .select('first_name', 'middle_name', 'last_name', 'full_name', NAME_PREFIX_FIELD);
    if (last) q = q.startAfter(last);
    const page = await q.limit(PAGE_SIZE).get();

    for (const doc of page.docs) {
      processed++;
      const x = doc.data();
      if (!x.first_name && !x.last_name && !x.full_name) {
        skipped++;
        continue;
      }
      const prefixes = namePrefixes(x);
      if (sameSet(x[NAME_PREFIX_FIELD], prefixes)) {
        unchanged++;
        continue;
      }
      updated++;
      // update() with one field path: every other field is left untouched.
      if (!dryRun) void writer.update(doc.ref, { [NAME_PREFIX_FIELD]: prefixes }).catch(() => {});
      if (processed % LOG_EVERY === 0) {
        console.log(`[${state}] ${processed} processed, ${updated} updated, ${unchanged} unchanged (${elapsed()} min)`);
      }
    }

    if (page.size < PAGE_SIZE) break;
    last = page.docs[page.size - 1];
    // Keep the write queue from growing without bound on big states.
    if (!dryRun) await writer.flush();
  }
  await writer.close();

  console.log(
    `\n${state}: ${processed} processed, ${updated} ${dryRun ? 'would update' : 'updated'}, ${unchanged} unchanged, ` +
      `${skipped} skipped (no name), ${failed} failed, in ${elapsed()} min` +
      (dryRun ? '  [DRY RUN, nothing written]' : '')
  );
  return processed > 0 && failed === 0;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const state = args.find((a) => !a.startsWith('--'))?.toLowerCase();
  const dryRun = args.includes('--dry-run');
  const known = US_STATES.map((s) => s.reference);
  if (!state || !known.includes(state)) {
    console.error('Usage: npx tsx scripts/addNamePrefixesByState.ts <state> [--dry-run]');
    console.error(state ? `Unknown state: ${state}` : 'No state given.');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(await loadServiceAccount()) });
  }
  const ok = await addNamePrefixes(admin.firestore(), state, dryRun);
  if (!ok) console.error(`\n${state}: FAILED (no records found, or some writes failed)`);
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
