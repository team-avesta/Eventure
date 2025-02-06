import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';
import { Module } from '@/services/adminS3Service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const screenshotId = params.id;
    const dataService = new S3DataService();

    // Get existing modules to find the screenshot
    const data = await dataService.getData<{ modules: Module[] }>('modules');
    const modules = data?.modules || [];

    // Find the module containing the screenshot
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

    // Delete the actual file from S3
    const key = `screenshots/${targetModule.key}/${screenshot.name}`;
    await dataService.deleteObject(key);

    // Update modules data
    const updatedModules = modules.map((mod) => ({
      ...mod,
      screenshots: mod.screenshots.filter((s) => s.id !== screenshotId),
    }));

    await dataService.updateData('modules', { modules: updatedModules });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete screenshot' },
      { status: 500 }
    );
  }
}
