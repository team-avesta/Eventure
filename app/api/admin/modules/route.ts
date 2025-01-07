import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Module name is required' },
        { status: 400 }
      );
    }

    // Read current DB
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // Initialize modules array if it doesn't exist
    if (!db.modules) {
      db.modules = [];
    }

    // Add new module
    const newModule = {
      id: Date.now().toString(),
      name: name.trim(),
      key: name.trim().toLowerCase().replace(/\s+/g, '-'),
    };

    db.modules.push(newModule);

    // Write back to DB
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(newModule);
  } catch (error) {
    console.error('Error adding module:', error);
    return NextResponse.json(
      { error: 'Failed to add module' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);
    return NextResponse.json(db.modules || []);
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
