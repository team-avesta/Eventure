import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { readDB, writeDB } from '@/lib/db';
import { Module, Screenshot } from '@/types';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export async function GET() {
  try {
    const db = await readDB();
    const allScreenshots = db.modules.flatMap((mod: Module) =>
      mod.screenshots.map((screenshot: Screenshot) => ({
        ...screenshot,
        moduleName: mod.name,
        moduleKey: mod.key,
      }))
    );
    return NextResponse.json(allScreenshots);
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json(
      { error: 'Error fetching screenshots' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const moduleKey = formData.get('pageName') as string;

    // Validation checks
    if (!file || !moduleKey) {
      return NextResponse.json(
        { error: 'File and module are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and GIF are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const db = await readDB();
    const targetModule = db.modules.find((m: Module) => m.key === moduleKey);

    if (!targetModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure screenshots directory exists
    const screenshotsDir = join(process.cwd(), 'public', 'screenshots');
    if (!existsSync(screenshotsDir)) {
      await mkdir(screenshotsDir, { recursive: true });
    }

    // Create unique filename
    const uniqueId = Date.now();
    const filename = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
    const path = `/screenshots/${filename}`;
    const fullPath = join(process.cwd(), 'public', path);

    // Save file
    try {
      await writeFile(fullPath, buffer);
    } catch (error) {
      console.error('Error writing file:', error);
      return NextResponse.json(
        { error: 'Error saving file to disk' },
        { status: 500 }
      );
    }

    // Create screenshot entry
    const screenshot: Screenshot = {
      id: uniqueId.toString(),
      name: file.name,
      url: path,
      pageName: moduleKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add screenshot to module
    targetModule.screenshots.push(screenshot);

    try {
      await writeDB(db);
    } catch (error) {
      console.error('Error updating database:', error);
      // Try to clean up the uploaded file if db update fails
      try {
        await unlink(fullPath);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
      return NextResponse.json(
        { error: 'Error saving to database' },
        { status: 500 }
      );
    }

    return NextResponse.json(screenshot);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error processing upload' },
      { status: 500 }
    );
  }
}
