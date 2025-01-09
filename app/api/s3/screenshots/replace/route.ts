import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3DataService } from '@/lib/s3/data';

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

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and GIF are allowed' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get and update modules using S3DataService
    const dataService = new S3DataService();
    const data = await dataService.getData<{ modules: any[] }>('modules');
    const modules = data?.modules || [];

    // Find the module containing the screenshot
    let targetModule;
    let existingScreenshot;
    for (const mod of modules) {
      existingScreenshot = mod.screenshots.find(
        (s: any) => s.id === screenshotId
      );
      if (existingScreenshot) {
        targetModule = mod;
        break;
      }
    }

    if (!targetModule || !existingScreenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Create filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${sanitizedName}`;
    const key = `screenshots/${targetModule.key}/${fileName}`;

    // Upload to S3
    await dataService.putObject(key, buffer, file.type);

    // Delete old file if it exists
    const oldKey = existingScreenshot.url.split('.com/')[1];
    if (oldKey) {
      try {
        await dataService.deleteObject(oldKey);
      } catch (error) {
        console.error('Error deleting old file:', error);
        // Continue even if delete fails
      }
    }

    // Update the screenshot URL in the modules
    const updatedModules = modules.map((module) => ({
      ...module,
      screenshots: module.screenshots.map((screenshot: any) => {
        if (screenshot.id === screenshotId) {
          return {
            ...screenshot,
            name: sanitizedName,
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${key}`,
            updatedAt: new Date().toISOString(),
          };
        }
        return screenshot;
      }),
    }));

    // Save the updated modules
    await dataService.updateData('modules', { modules: updatedModules });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error replacing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to replace screenshot' },
      { status: 500 }
    );
  }
}
