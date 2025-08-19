import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getDecryptedFlagByName } from '@/lib/flags';

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  if (!name) return NextResponse.json({ message: 'name is required' }, { status: 400 });
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
  try {
    const flag = getDecryptedFlagByName(db, name);
    return NextResponse.json({ flag });
  } finally { db.close(); }
}

