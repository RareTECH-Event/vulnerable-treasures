import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const via = (request as any).headers?.get?.('via-ssrf-proxy');
  if (!via) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({
    endpoints: [
      '/api/internal/healthcheck',
      '/api/internal/flag',
    ],
  });
}
