import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const dataService = new S3DataService();
    const data = await dataService.getData(params.type);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch ${params.type}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const body = await request.json();
    const dataService = new S3DataService();

    // Special handling for event types
    if (params.type === 'event-names') {
      if (body.eventNames && Array.isArray(body.eventNames)) {
        // Convert any objects with name property to strings
        const normalizedNames = body.eventNames
          .map((item: any) => (typeof item === 'string' ? item : item.name))
          .filter(Boolean);

        await dataService.updateData(params.type, {
          eventNames: normalizedNames,
        });
        return NextResponse.json({ success: true });
      }
    }

    if (params.type === 'event-categories') {
      if (body.eventCategory && Array.isArray(body.eventCategory)) {
        const normalizedCategories = body.eventCategory
          .map((item: any) => (typeof item === 'string' ? item : item.name))
          .filter(Boolean);

        await dataService.updateData(params.type, {
          eventCategory: normalizedCategories,
        });
        return NextResponse.json({ success: true });
      }
    }

    if (params.type === 'event-actions') {
      if (body.eventAction && Array.isArray(body.eventAction)) {
        const normalizedActions = body.eventAction
          .map((item: any) => (typeof item === 'string' ? item : item.name))
          .filter(Boolean);

        await dataService.updateData(params.type, {
          eventAction: normalizedActions,
        });
        return NextResponse.json({ success: true });
      }
    }

    // For other data types
    await dataService.updateData(params.type, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update ${params.type}` },
      { status: 500 }
    );
  }
}
