import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db/db.json');

export async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
