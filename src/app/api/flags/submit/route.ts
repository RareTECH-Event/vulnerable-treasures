import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { decryptFlag } from '@/lib/flagCrypto';

export async function POST(request: Request) {
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'));

  try {
    const { flag } = await request.json();

    if (!flag) {
      return NextResponse.json({ message: 'Flag is required' }, { status: 400 });
    }

    const rows = db.prepare("SELECT id, name, value, is_captured FROM flags").all() as any[];
    const matched = rows.find(r => {
      try { return decryptFlag(r.value) === flag; } catch { return false; }
    });

    if (matched) {
      if (matched.is_captured) {
        return NextResponse.json({ message: `Flag '${matched.name}' has already been captured.` });
      } else {
        db.prepare("UPDATE flags SET is_captured = 1 WHERE id = ?").run(matched.id);
        return NextResponse.json({ message: `Congratulations! You have captured the flag for: ${matched.name}` });
      }
    } else {
      return NextResponse.json({ message: 'Invalid flag.' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
