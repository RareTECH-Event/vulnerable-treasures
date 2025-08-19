import { NextResponse } from 'next/server';
import { Parser } from 'xml2js';
import Database from 'better-sqlite3';
import path from 'path';
import { getDecryptedFlagByName } from '@/lib/flags';

// This is a mock for the challenge. In a real scenario, this file wouldn't exist.
const fakeEtcFlagPath = '/etc/flag';

export async function POST(request: Request) {
  try {
    const xml = await request.text();
    const lower = xml.toLowerCase();
    const hasDoctype = lower.includes('<!doctype');
    const referencesEtcFlag = lower.includes('file:///etc/flag');

    // If a DOCTYPE is present (the intended exploit path), short-circuit into a
    // friendly mocked response that demonstrates XXE impact reliably for learners.
    if (hasDoctype) {
      const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
      try {
        const flag = getDecryptedFlagByName(db, 'XXE');
        const mocked = { data: { test: referencesEtcFlag ? flag : 'DOCTYPE detected', flag } } as any;
        return NextResponse.json(mocked);
      } finally { db.close(); }
    }

    // Otherwise, parse normal XML payloads
    const parser = new Parser({ explicitArray: false });
    return new Promise((resolve) => {
      parser.parseString(xml, (err: Error | null, result: object) => {
        if (err) {
          console.error('XML parsing error:', err);
          resolve(NextResponse.json({ message: 'Invalid XML format' }, { status: 400 }));
          return;
        }
        resolve(NextResponse.json(result));
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
