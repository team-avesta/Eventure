import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'db.json');
    const dbContent = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbContent);

    const decodedName = decodeURIComponent(params.name);
    const categoryIndex = db.eventCategories.indexOf(decodedName);

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Event category not found' },
        { status: 404 }
      );
    }

    // Remove the category
    db.eventCategories.splice(categoryIndex, 1);

    // Write back to the file
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({
      message: 'Event category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event category:', error);
    return NextResponse.json(
      { error: 'Failed to delete event category' },
      { status: 500 }
    );
  }
}
