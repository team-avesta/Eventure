import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

export async function POST(request: Request) {
  try {
    const { title, url } = await request.json();

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Read current DB
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // Initialize pageData array if it doesn't exist
    if (!db.pageData) {
      db.pageData = [];
    }

    // Check if page already exists
    const pageExists = db.pageData.some(
      (page: any) => page.url === url.trim() || page.title === title.trim()
    );

    if (pageExists) {
      return NextResponse.json(
        { error: 'Page with this URL or title already exists' },
        { status: 400 }
      );
    }

    // Add new page
    const newPage = {
      id: (db.pageData.length + 1).toString(),
      title: title.trim(),
      url: url.trim(),
    };

    db.pageData.push(newPage);

    // Write back to DB
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(newPage);
  } catch (error) {
    console.error('Error adding pageview:', error);
    return NextResponse.json(
      { error: 'Failed to add pageview' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);
    return NextResponse.json(db.pageData || []);
  } catch (error) {
    console.error('Error fetching pageviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pageviews' },
      { status: 500 }
    );
  }
}
