import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { ServiceAccount } from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadServiceAccount(): Promise<ServiceAccount> {
  try {
    // Try to load from environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
    }

    // If not in environment variable, try to load from file
    const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
    const serviceAccountJson = await fs.readFile(serviceAccountPath, 'utf-8');
    return JSON.parse(serviceAccountJson) as ServiceAccount;
  } catch (error) {
    console.error('Error loading service account:', error);
    throw new Error('Failed to load Firebase service account');
  }
}
