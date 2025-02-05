import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';
import { Module } from '@/services/adminS3Service';

export async function POST(request: NextRequest) {
  try {
    const { screenshotId, key } = await request.json();

    if (!screenshotId || !key) {
      return NextResponse.json(
        { error: 'Screenshot ID and key are required' },
        { status: 400 }
      );
    }

    const s3Service = new S3DataService();
    const data = await s3Service.getData<{ modules: Module[] }>('modules');
    const modules = data?.modules || [];

    // Find the module and screenshot
    let targetModule: Module | undefined;
    let screenshot;

    for (const mod of modules) {
      screenshot = mod.screenshots.find((s) => s.id === screenshotId);
      if (screenshot) {
        targetModule = mod;
        break;
      }
    }

    if (!targetModule || !screenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    // Update screenshot URL
    const updatedModules = modules.map((module) => ({
      ...module,
      screenshots: module.screenshots.map((s) =>
        s.id === screenshotId
          ? {
              ...s,
              url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${key}`,
              updatedAt: new Date().toISOString(),
            }
          : s
      ),
    }));

    await s3Service.updateData('modules', { modules: updatedModules });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error replacing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to replace screenshot' },
      { status: 500 }
    );
  }
}
