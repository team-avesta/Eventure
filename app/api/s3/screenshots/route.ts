import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';
import { Module, ScreenshotStatus } from '@/services/adminS3Service';

export async function POST(request: NextRequest) {
  try {
    const { key, pageName, customName } = await request.json();

    // Validate the upload and update database/metadata
    const s3Service = new S3DataService();
    await s3Service.processScreenshotUpload({
      key,
      pageName,
      customName,
      status: ScreenshotStatus.TODO,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to process screenshot' },
      { status: 500 }
    );
  }
}
