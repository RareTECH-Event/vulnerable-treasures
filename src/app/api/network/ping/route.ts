import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { host } = await request.json();

    if (!host) {
      return NextResponse.json({ message: 'Host is required' }, { status: 400 });
    }

    // VULNERABILITY: Command Injection (intended)
    const command = `ping -c 2 -n -w 4 ${host}`;

    return new Promise((resolve) => {
      exec(command, { cwd: path.join(process.cwd(), '.flags') }, (error, stdout, stderr) => {
        const output = ((stdout || '') + (stderr || '')).toString();
        resolve(NextResponse.json({ output }));
      });
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
