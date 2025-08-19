import crypto from 'crypto';

const KEY = crypto.createHash('sha256').update('vulnerable-treasures-secret-key').digest(); // 32 bytes
const IV = Buffer.from('1234567890abcdef'); // 16 bytes (static for demo)

export function encryptFlag(plain: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
  const enc = Buffer.concat([cipher.update(Buffer.from(plain, 'utf8')), cipher.final()]);
  return enc.toString('base64');
}

export function decryptFlag(encB64: string): string {
  const data = Buffer.from(encB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

