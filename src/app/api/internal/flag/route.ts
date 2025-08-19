import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getDecryptedFlagByName } from '@/lib/flags';

export async function GET(request: Request) {
  const via = (request as any).headers?.get?.('via-ssrf-proxy');
  if (!via) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
  try {
    const flag = getDecryptedFlagByName(db, 'SSRF');
    return NextResponse.json({ flag });
  } finally { db.close(); }
}
