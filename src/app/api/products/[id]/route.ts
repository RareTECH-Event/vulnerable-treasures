import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });

  try {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const comments = db.prepare("SELECT * FROM comments WHERE product_id = ? ORDER BY created_at ASC").all(id);

    return NextResponse.json({ product, comments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
