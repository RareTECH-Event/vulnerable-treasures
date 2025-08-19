import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_public: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });

  try {
    // VULNERABILITY: SQL Injection (intended)
    const searchQuery = `SELECT * FROM products WHERE name LIKE '%${query}%' AND is_public = 1`;
    const products: Product[] = db.prepare(searchQuery).all() as Product[];
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
