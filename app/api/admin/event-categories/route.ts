import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Read current DB
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // Initialize eventCategories array if it doesn't exist
    if (!db.eventCategories) {
      db.eventCategories = [];
    }

    // Check if category already exists
    if (db.eventCategories.includes(name.trim())) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Add new category
    db.eventCategories.push(name.trim());

    // Write back to DB
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding event category:', error);
    return NextResponse.json(
      { error: 'Failed to add event category' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);
    return NextResponse.json(db.eventCategories || []);
  } catch (error) {
    console.error('Error fetching event categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event categories' },
      { status: 500 }
    );
  }
}
