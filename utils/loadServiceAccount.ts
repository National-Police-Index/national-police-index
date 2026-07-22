import type { ServiceAccount } from 'firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';
const projectRoot = path.resolve(__dirname, '..');

export async function loadServiceAccount(): Promise<ServiceAccount> {
  try {
    // Try to load from environment variable first
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
    }

    // If not in environment variable, try to load from file
    const serviceAccountPath = path.join(projectRoot, 'firebase-service-account.json');
    const serviceAccountJson = await fs.readFile(serviceAccountPath, 'utf-8');
    return JSON.parse(serviceAccountJson) as ServiceAccount;
  } catch (error) {
    console.error('Error loading service account:', error);
    throw new Error('Failed to load Firebase service account');
  }
}
