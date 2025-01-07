import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'db/db.json');
    const dbContent = JSON.parse(readFileSync(dbPath, 'utf-8'));

    return NextResponse.json({
      pageData: dbContent.pageData || [],
      dimensions: dbContent.dimensions || [],
      eventCategories: dbContent.eventCategories || [],
      eventActionNames: dbContent.eventActionNames || [],
      eventNames: dbContent.eventNames || [],
    });
  } catch (error) {
    console.error('Error reading dropdown data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dropdown data' },
      { status: 500 }
    );
  }
}
