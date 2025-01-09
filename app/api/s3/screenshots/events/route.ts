import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const screenshotId = searchParams.get('screenshotId');

    if (!screenshotId) {
      return NextResponse.json(
        { error: 'Screenshot ID is required' },
        { status: 400 }
      );
    }

    const dataService = new S3DataService();
    const data = await dataService.getData<{ events: any[] }>('events');
    const events = data?.events || [];

    // Filter events for the specific screenshot
    const screenshotEvents = events.filter(
      (event) => event.screenshotId === screenshotId
    );

    return NextResponse.json(screenshotEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    const dataService = new S3DataService();
    const data = await dataService.getData<{ events: any[] }>('events');
    const events = data?.events || [];

    // Add new event
    events.push(event);

    // Update events in S3
    await dataService.updateData('events', { events });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
