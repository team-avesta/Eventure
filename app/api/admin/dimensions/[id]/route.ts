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

    // Find the dimension index
    const dimensionIndex = db.dimensions.findIndex(
      (dimension: { id: string }) => dimension.id === params.id
    );

    if (dimensionIndex === -1) {
      return NextResponse.json(
        { error: 'Dimension not found' },
        { status: 404 }
      );
    }

    // Remove the dimension
    db.dimensions.splice(dimensionIndex, 1);

    // Write back to the file
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'Dimension deleted successfully' });
  } catch (error) {
    console.error('Error deleting dimension:', error);
    return NextResponse.json(
      { error: 'Failed to delete dimension' },
      { status: 500 }
    );
  }
}
