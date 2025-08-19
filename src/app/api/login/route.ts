import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

interface User {
  id: number;
  username: string;
  role: string;
  password?: string;
}

export async function POST(request: Request) {
  const db = new Database(path.join(process.cwd(), 'db', 'database.db'));

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Special-case: real admin password is stored separately
    try {
      if (username === 'admin') {
        const row = db.prepare("SELECT id, username, role FROM users WHERE username = ?").get('admin') as User | undefined;
        const secret = db.prepare("SELECT value FROM admin_secrets WHERE key = ?").get('admin_password') as any;
        const real = secret?.value as string | undefined;
        if (row && real && password === real) {
          const responseData = {
            message: 'Login successful!',
            user: { id: row.id, username: row.username, role: row.role },
            flags: { adminLogin: '1' },
          };
          return NextResponse.json(responseData);
        }
      }
    } catch {}

    // Special-case: brute-force challenge for alice (accept weak password regardless of stored hash)
    if (username === 'alice' && password === 'password123') {
      const row = db.prepare("SELECT id, username, role FROM users WHERE username = ?").get('alice') as User | undefined;
      if (row) {
        const responseData: { message: string; user: User; flag?: string } = {
          message: 'Login successful!',
          user: { id: row.id, username: row.username, role: row.role },
          // Fetch brute-force flag dynamically for the UI to show
          flag: undefined,
        };
        try {
          const frow = db.prepare('SELECT value FROM flags WHERE name = ?').get('Brute Force') as any;
          if (frow) {
            // Decrypt inline to avoid importing crypto here (keep it simple)
            // We rely on UI to fetch by name generally; returning nothing is fine too.
            responseData.flag = undefined;
          }
        } catch {}
        return NextResponse.json(responseData);
      }
    }

    // VULNERABILITY: SQL Injection (fallback, including admin bypass)
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    // Intentionally vulnerable for the challenge (no parameterization)
    const user: User | undefined = db.prepare(query).get() as User | undefined;

    if (user) {
      // Build flags based on how the login was achieved.
      const flags: Record<string, string> = {};

      // Auth bypass: the provided password didn't actually match the stored one
      if (password !== user.password) {
        flags.authBypass = '1';
      }

      const responseData: { message: string; user: User; flags?: Record<string, string> } = {
        message: 'Login successful!',
        user: { id: user.id, username: user.username, role: user.role },
      };
      if (Object.keys(flags).length > 0) {
        responseData.flags = flags;
      }
      return NextResponse.json(responseData);
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  } finally {
    db.close();
  }
}
