import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';
import { Module } from '@/services/adminS3Service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const pageName = formData.get('pageName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!pageName) {
      return NextResponse.json(
        { error: 'No module selected' },
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

    const dataService = new S3DataService();

    // Get existing modules to validate module exists
    const data = await dataService.getData<{ modules: Module[] }>('modules');
    const modules = data?.modules || [];
    const targetModule = modules.find((m: Module) => m.key === pageName);

    if (!targetModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Convert file to buffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${timestamp}-${sanitizedName}`;
    const key = `screenshots/${pageName}/${fileName}`;

    await dataService.putObject(key, buffer, file.type);

    // Update module with new screenshot
    const screenshot = {
      id: timestamp.toString(),
      name: sanitizedName,
      url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      pageName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    targetModule.screenshots = [
      ...(targetModule.screenshots || []),
      screenshot,
    ];
    await dataService.updateData('modules', { modules });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to upload screenshot' },
      { status: 500 }
    );
  }
}
