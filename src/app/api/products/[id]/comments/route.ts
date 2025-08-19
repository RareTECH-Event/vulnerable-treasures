import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'));

  try {
    const { username, comment } = await request.json();

    if (!username || !comment) {
      return NextResponse.json({ message: 'Username and comment are required' }, { status: 400 });
    }

    // VULNERABILITY: Stored XSS
    // The comment is inserted into the database without any sanitization.
    // When rendered on the product page, any embedded scripts will execute.
    const stmt = db.prepare("INSERT INTO comments (product_id, username, comment) VALUES (?, ?, ?)");
    const result = stmt.run(id, username, comment);

    const newComment = {
      id: result.lastInsertRowid,
      product_id: Number(id),
      username,
      comment,
      created_at: new Date().toISOString(),
    };

    // No flag is returned here. Learners must craft a payload that executes on view
    // and reveals the hidden flag available on the product page DOM.
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
