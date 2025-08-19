import { NextResponse } from 'next/server';

export async function GET() {
  const nonce = Math.random().toString(36).slice(2);
  const res = new NextResponse(null, { status: 204 });
  res.headers.append('Set-Cookie', `xss_ref_nonce=${nonce}; Path=/; SameSite=Lax`);
  return res;
}

