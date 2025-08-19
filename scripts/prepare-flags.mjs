import crypto from 'crypto';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const KEY = crypto.createHash('sha256').update('vulnerable-treasures-secret-key').digest();
const IV = Buffer.from('1234567890abcdef');
function decryptFlag(encB64) {
  const data = Buffer.from(encB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

const db = new Database(path.join(process.cwd(), 'db', 'database.db'));
try {
  const rows = db.prepare('SELECT name, value FROM flags').all();
  const map = Object.fromEntries(rows.map(r => [r.name, r.value]));
  const ptFlag = decryptFlag(map['Path Traversal']);
  const ciFlag = decryptFlag(map['Command Injection']);

  fs.mkdirSync(path.join(process.cwd(), '.flags'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), '.flags', 'command.txt'), ciFlag, 'utf8');
  fs.writeFileSync(path.join(process.cwd(), 'flag.txt'), ptFlag, 'utf8');
} catch (e) {
  console.error('prepare-flags error:', e);
} finally {
  db.close();
}

