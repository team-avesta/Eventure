import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Event } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const screenshotId = searchParams.get('screenshotId');

  if (!screenshotId) {
    return NextResponse.json(
      { error: 'Screenshot ID is required' },
      { status: 400 }
    );
  }

  const db = await readDB();
  const events = db.events.filter(
    (e: Event) => e.screenshotId === screenshotId
  );

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const event: Event = await request.json();

  if (!event.screenshotId) {
    return NextResponse.json(
      { error: 'Screenshot ID is required' },
      { status: 400 }
    );
  }

  const db = await readDB();
  db.events.push(event);
  await writeDB(db);

  return NextResponse.json(event);
}

export async function PUT(request: Request) {
  const event: Event = await request.json();
  const eventId = request.url.split('/').pop();

  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  const db = await readDB();
  const eventIndex = db.events.findIndex((e: Event) => e.id === eventId);

  if (eventIndex === -1) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Update the event with new coordinates
  db.events[eventIndex] = {
    ...db.events[eventIndex],
    coordinates: {
      startX: event.coordinates.startX,
      startY: event.coordinates.startY,
      width: event.coordinates.width,
      height: event.coordinates.height,
    },
  };

  await writeDB(db);
  return NextResponse.json(db.events[eventIndex]);
}

export async function DELETE(request: Request) {
  const eventId = request.url.split('/').pop();

  if (!eventId) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  const db = await readDB();
  const eventIndex = db.events.findIndex((e: Event) => e.id === eventId);

  if (eventIndex === -1) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  db.events.splice(eventIndex, 1);
  await writeDB(db);

  return NextResponse.json({ success: true });
}
