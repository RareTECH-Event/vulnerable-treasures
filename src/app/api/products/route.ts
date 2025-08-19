import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
  try {
    const products = db.prepare("SELECT * FROM products WHERE is_public = 1").all();
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
