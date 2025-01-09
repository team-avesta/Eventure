import { NextRequest, NextResponse } from 'next/server';
import { S3DataService } from '@/lib/s3/data';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const updatedEvent = await request.json();
    const dataService = new S3DataService();
    const data = await dataService.getData<{ events: any[] }>('events');
    let events = data?.events || [];

    // Update existing event
    events = events.map((e) => (e.id === eventId ? updatedEvent : e));

    // Update events in S3
    await dataService.updateData('events', { events });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const dataService = new S3DataService();
    const data = await dataService.getData<{ events: any[] }>('events');
    let events = data?.events || [];

    // Remove event
    events = events.filter((e) => e.id !== eventId);

    // Update events in S3
    await dataService.updateData('events', { events });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
