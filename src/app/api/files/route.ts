import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { getDecryptedFlagByName } from '@/lib/flags';

// VULNERABILITY: Path Traversal
// This endpoint naively joins a base directory with the user-supplied path
// without proper normalization or validation, allowing "../" traversal.
// Intended for educational purposes in the CTF.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPath = searchParams.get('path');

    if (!userPath) {
      return NextResponse.json({ message: 'Query parameter "path" is required' }, { status: 400 });
    }

    // Intended insecure base directory
    const baseDir = path.join(process.cwd(), 'public', 'files');
    const targetPath = path.join(baseDir, userPath); // Insecure join: allows traversal
    const normalized = path.normalize(targetPath);
    const escaped = !normalized.startsWith(baseDir);

    // If the requested normalized path points to /app/flag.txt and the file is missing,
    // generate it on-the-fly by decrypting the Path Traversal flag from DB.
    const flagTarget = path.join(process.cwd(), 'flag.txt');
    if (!fs.existsSync(normalized) && normalized === flagTarget) {
      try {
        const db = new Database(path.join(process.cwd(), 'db', 'database.db'));
        const flag = getDecryptedFlagByName(db, 'Path Traversal');
        db.close();
        if (flag) {
          fs.writeFileSync(flagTarget, flag, 'utf8');
        }
      } catch {}
    }

    if (!fs.existsSync(normalized)) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    const content = fs.readFileSync(normalized, 'utf8');
    const res = new NextResponse(content, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
    return res;
  } catch (error) {
    console.error('File read error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
