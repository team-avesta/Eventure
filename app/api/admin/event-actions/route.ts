import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Action name is required' },
        { status: 400 }
      );
    }

    // Read current DB
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // Initialize eventActionNames array if it doesn't exist
    if (!db.eventActionNames) {
      db.eventActionNames = [];
    }

    // Check if action already exists
    if (db.eventActionNames.includes(name.trim())) {
      return NextResponse.json(
        { error: 'Action name already exists' },
        { status: 400 }
      );
    }

    // Add new action
    db.eventActionNames.push(name.trim());

    // Write back to DB
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding event action:', error);
    return NextResponse.json(
      { error: 'Failed to add event action' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);
    return NextResponse.json(db.eventActionNames || []);
  } catch (error) {
    console.error('Error fetching event actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event actions' },
      { status: 500 }
    );
  }
}
