import { Event } from '@/types';

export const screenshotEventsService = {
  async fetchEvents(screenshotId: string): Promise<Event[]> {
    const response = await fetch(
      `/api/s3/screenshots/events?screenshotId=${screenshotId}`
    );
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async createEvent(event: Event): Promise<Event> {
    const response = await fetch('/api/s3/screenshots/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  async updateEvent(event: Event): Promise<Event> {
    const response = await fetch(`/api/s3/screenshots/events/${event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },

  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`/api/s3/screenshots/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete event');
  },

  async fetchDropdownData() {
    const response = await fetch('/api/s3/dropdowns');
    if (!response.ok) throw new Error('Failed to fetch dropdown data');
    return response.json();
  },

  async replaceImage(screenshotId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('screenshotId', screenshotId);

    const response = await fetch('/api/s3/screenshots/replace', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to replace image');
    }
  },
};
