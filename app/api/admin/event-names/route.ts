import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      );
    }

    // Read current DB
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // Initialize eventNames array if it doesn't exist
    if (!db.eventNames) {
      db.eventNames = [];
    }

    // Check if event name already exists
    if (db.eventNames.includes(name.trim())) {
      return NextResponse.json(
        { error: 'Event name already exists' },
        { status: 400 }
      );
    }

    // Add new event name
    db.eventNames.push(name.trim());

    // Write back to DB
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding event name:', error);
    return NextResponse.json(
      { error: 'Failed to add event name' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);
    return NextResponse.json(db.eventNames || []);
  } catch (error) {
    console.error('Error fetching event names:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event names' },
      { status: 500 }
    );
  }
}
