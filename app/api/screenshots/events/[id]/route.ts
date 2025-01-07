import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Event } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  const event: Event = await request.json();

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

  // Update all event properties
  db.events[eventIndex] = {
    ...db.events[eventIndex],
    ...event,
  };

  await writeDB(db);
  return NextResponse.json(db.events[eventIndex]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;

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
