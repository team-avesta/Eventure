import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const screenshotId = formData.get('screenshotId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!screenshotId) {
      return NextResponse.json(
        { error: 'No screenshot ID provided' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueFilename = `${Date.now()}_${file.name}`;

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save the file
    const filePath = join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Get current modules
    const modulesResponse = await fetch(new URL('/api/modules', request.url));
    if (!modulesResponse.ok) {
      throw new Error('Failed to fetch modules');
    }
    const modules = await modulesResponse.json();

    // Update the screenshot URL in the modules
    let updated = false;
    const updatedModules = modules.map((module: any) => ({
      ...module,
      screenshots: module.screenshots.map((screenshot: any) => {
        if (screenshot.id === screenshotId) {
          updated = true;
          return {
            ...screenshot,
            url: `/uploads/${uniqueFilename}`,
          };
        }
        return screenshot;
      }),
    }));

    if (!updated) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Save the updated modules
    const updateResponse = await fetch(new URL('/api/modules', request.url), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedModules),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update modules');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error replacing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to replace screenshot' },
      { status: 500 }
    );
  }
}
