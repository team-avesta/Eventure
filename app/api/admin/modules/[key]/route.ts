import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'db.json');
    const data = JSON.parse(await fs.readFile(dbPath, 'utf8'));

    const moduleIndex = data.modules.findIndex(
      (module: any) => module.key === params.key
    );

    if (moduleIndex === -1) {
      return new NextResponse('Module not found', { status: 404 });
    }

    // Remove the module
    data.modules.splice(moduleIndex, 1);

    // Write the updated data back to the file
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

    return new NextResponse('Module deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting module:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
