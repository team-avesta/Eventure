import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'db', 'db.json');

export async function GET() {
  try {
    const db = await readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(db);
    return NextResponse.json(data.modules);
  } catch (error) {
    console.error('Error reading modules:', error);
    return NextResponse.json(
      { error: 'Failed to read modules' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const modules = await request.json();
    const db = await readFile(DB_PATH, 'utf-8');
    const data = JSON.parse(db);
    data.modules = modules;
    await writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating modules:', error);
    return NextResponse.json(
      { error: 'Failed to update modules' },
      { status: 500 }
    );
  }
}
