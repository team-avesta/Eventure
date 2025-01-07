import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'db.json');

export async function POST(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id?.trim() || !name?.trim()) {
      return NextResponse.json(
        { error: 'Dimension number and name are required' },
        { status: 400 }
      );
    }

    // Read current DB
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);

    // Initialize dimensions array if it doesn't exist
    if (!db.dimensions) {
      db.dimensions = [];
    }

    // Check if dimension already exists
    const dimensionExists = db.dimensions.some(
      (dimension: any) =>
        dimension.id === id.trim() || dimension.name === name.trim()
    );

    if (dimensionExists) {
      return NextResponse.json(
        { error: 'Dimension with this number or name already exists' },
        { status: 400 }
      );
    }

    // Add new dimension
    const newDimension = {
      id: id.trim(),
      name: name.trim(),
    };

    db.dimensions.push(newDimension);

    // Write back to DB
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));

    return NextResponse.json(newDimension);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add dimension' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbContent);
    return NextResponse.json(db.dimensions || []);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dimensions' },
      { status: 500 }
    );
  }
}
