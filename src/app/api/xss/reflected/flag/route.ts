import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getDecryptedFlagByName } from '@/lib/flags';

export async function GET() {
  const nonce = cookies().get('xss_ref_nonce')?.value;
  if (!nonce) return NextResponse.json({ message: 'Not eligible' }, { status: 403 });
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
  try {
    const flag = getDecryptedFlagByName(db, 'Reflected XSS');
    return NextResponse.json({ flag });
  } finally { db.close(); }
}
