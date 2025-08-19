import Database from 'better-sqlite3';
import { decryptFlag } from '@/lib/flagCrypto';

export function getDecryptedFlagByName(db: Database.Database, name: string): string | null {
  try {
    const row = db.prepare('SELECT value FROM flags WHERE name = ?').get(name) as any;
    if (!row) return null;
    return decryptFlag(row.value);
  } catch {
    return null;
  }
}

