import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'db.json');
    const dbContent = await fs.readFile(dbPath, 'utf-8');
    const db = JSON.parse(dbContent);

    // Find the pageview index
    const pageviewIndex = db.pageData.findIndex(
      (pageview: { id: string }) => pageview.id === params.id
    );

    if (pageviewIndex === -1) {
      return NextResponse.json(
        { error: 'PageView not found' },
        { status: 404 }
      );
    }

    // Remove the pageview
    db.pageData.splice(pageviewIndex, 1);

    // Write back to the file
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'PageView deleted successfully' });
  } catch (error) {
    console.error('Error deleting pageview:', error);
    return NextResponse.json(
      { error: 'Failed to delete pageview' },
      { status: 500 }
    );
  }
}
