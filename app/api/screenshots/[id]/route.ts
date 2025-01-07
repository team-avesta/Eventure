import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Module, Screenshot } from '@/types';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const screenshotId = params.id;
    const db = await readDB();

    // Find the module containing the screenshot
    let targetModule: Module | undefined;
    let screenshotIndex = -1;

    for (const mod of db.modules) {
      screenshotIndex = mod.screenshots.findIndex(
        (s: Screenshot) => s.id === screenshotId
      );
      if (screenshotIndex !== -1) {
        targetModule = mod;
        break;
      }
    }

    if (!targetModule || screenshotIndex === -1) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Get the screenshot URL before removing it
    const screenshot = targetModule.screenshots[screenshotIndex];
    const fullPath = join(process.cwd(), 'public', screenshot.url);

    // Remove screenshot from the module
    targetModule.screenshots.splice(screenshotIndex, 1);

    // Save the updated DB
    await writeDB(db);

    // Delete the actual file
    try {
      await unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Even if file deletion fails, we've already updated the DB
      // so we'll just log the error and continue
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to delete screenshot' },
      { status: 500 }
    );
  }
}
