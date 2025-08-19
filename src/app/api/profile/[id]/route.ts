import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getDecryptedFlagByName } from '@/lib/flags';

interface UserProfile {
  id: number;
  username: string;
  role: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });

  try {
    // VULNERABILITY: Insecure Direct Object Reference (IDOR)
    const user: UserProfile | undefined = db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(id) as UserProfile | undefined;

    if (user) {
      const responseData: { id: number; username: string; role: string; flag?: string } = { ...user };
      if (user.username === 'admin' && user.id === 1) {
        const flag = getDecryptedFlagByName(db, 'IDOR');
        responseData.flag = flag || undefined;
      }
      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
