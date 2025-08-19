import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getDecryptedFlagByName } from '@/lib/flags';

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) {
    return NextResponse.json({ message: 'Missing url parameter' }, { status: 400 });
  }
  try {
    const u = new URL(target);
    const init: RequestInit = { method: 'GET', headers: {} };
    // When targeting loopback, add a quirky header that internal endpoints expect
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') {
      (init.headers as any)['Via-SSRF-Proxy'] = '1';
      // If fetching this same app's internal endpoints, emulate the response to avoid networking quirks
      if (u.port === '' || u.port === process.env.PORT || u.port === '3000') {
        if (u.pathname === '/api/internal/flag') {
          const db = new Database(path.join(process.cwd(), 'db', 'database.db'), { readonly: true });
          try {
            const flag = getDecryptedFlagByName(db, 'SSRF');
            return NextResponse.json({ flag });
          } finally { db.close(); }
        }
        if (u.pathname === '/api/internal/healthcheck') {
          return NextResponse.json({ status: 'ok' });
        }
        if (u.pathname === '/api/internal/sitemap') {
          return NextResponse.json({ endpoints: ['/api/internal/healthcheck', '/api/internal/flag'] });
        }
      }
    }
    const res = await fetch(u.toString(), init);
    const body = await res.text();
    const out = new NextResponse(body, { status: res.status });
    const ct = res.headers.get('content-type') || 'text/plain; charset=utf-8';
    out.headers.set('Content-Type', ct);
    return out;
  } catch (e) {
    return NextResponse.json({ message: 'Fetch failed' }, { status: 500 });
  }
}
