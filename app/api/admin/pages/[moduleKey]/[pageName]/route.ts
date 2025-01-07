import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { moduleKey: string; pageName: string } }
) {
  try {
    const dbPath = path.join(process.cwd(), 'db', 'db.json');
    const data = JSON.parse(await fs.readFile(dbPath, 'utf8'));

    const moduleIndex = data.modules.findIndex(
      (module: any) => module.key === params.moduleKey
    );

    if (moduleIndex === -1) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const pageIndex = data.modules[moduleIndex].pages.indexOf(params.pageName);
    if (pageIndex === -1) {
      return NextResponse.json(
        { error: 'Page not found in module' },
        { status: 404 }
      );
    }

    // Remove the page from the module's pages array
    data.modules[moduleIndex].pages.splice(pageIndex, 1);

    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
