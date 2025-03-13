import { EEventType } from '@/services/adminS3Service';
import { screenshotEventsService } from '@/services/screenshotEvents';
import { Event } from '@/types';

describe('screenshotEventsService', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  const mockEvent: Event = {
    id: '1',
    screenshotId: 'screenshot1',
    coordinates: {
      startX: 0,
      startY: 0,
      width: 100,
      height: 100,
    },
    eventType: EEventType.PageView,
    name: 'Test Event',
    category: 'Test Category',
    action: 'Test Action',
    value: 'Test Value',
    dimensions: ['dim1', 'dim2'],
  };

  describe('fetchEvents', () => {
    it('should successfully fetch events for a screenshot', async () => {
      const mockEvents = [mockEvent];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      });

      const events = await screenshotEventsService.fetchEvents('screenshot1');
      expect(events).toEqual(mockEvents);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/s3/screenshots/events?screenshotId=screenshot1'
      );
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        screenshotEventsService.fetchEvents('screenshot1')
      ).rejects.toThrow('Failed to fetch events');
    });
  });

  describe('createEvent', () => {
    it('should successfully create an event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvent),
      });

      const createdEvent = await screenshotEventsService.createEvent(mockEvent);
      expect(createdEvent).toEqual(mockEvent);
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/screenshots/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockEvent),
      });
    });

    it('should throw error when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        screenshotEventsService.createEvent(mockEvent)
      ).rejects.toThrow('Failed to create event');
    });
  });

  describe('updateEvent', () => {
    it('should successfully update an event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvent),
      });

      const updatedEvent = await screenshotEventsService.updateEvent(mockEvent);
      expect(updatedEvent).toEqual(mockEvent);
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/screenshots/events/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockEvent),
      });
    });

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        screenshotEventsService.updateEvent(mockEvent)
      ).rejects.toThrow('Failed to update event');
    });
  });

  describe('deleteEvent', () => {
    it('should successfully delete an event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await screenshotEventsService.deleteEvent('1');
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/screenshots/events/1', {
        method: 'DELETE',
      });
    });

    it('should throw error when deletion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(screenshotEventsService.deleteEvent('1')).rejects.toThrow(
        'Failed to delete event'
      );
    });
  });

  describe('fetchDropdownData', () => {
    it('should successfully fetch dropdown data', async () => {
      const mockDropdownData = {
        pageData: [],
        dimensions: [],
        eventCategories: [],
        eventActionNames: [],
        eventNames: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDropdownData),
      });

      const data = await screenshotEventsService.fetchDropdownData();
      expect(data).toEqual(mockDropdownData);
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/dropdowns');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(screenshotEventsService.fetchDropdownData()).rejects.toThrow(
        'Failed to fetch dropdown data'
      );
    });
  });

  describe('replaceImage', () => {
    it('should successfully replace an image', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const file = new File([''], 'test.png', { type: 'image/png' });
      await screenshotEventsService.replaceImage('screenshot1', file);

      const expectedFormData = new FormData();
      expectedFormData.append('file', file);
      expectedFormData.append('screenshotId', 'screenshot1');

      expect(mockFetch).toHaveBeenCalledWith('/api/s3/screenshots/replace', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    it('should throw error when replacement fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Error message'),
      });

      const file = new File([''], 'test.png', { type: 'image/png' });
      await expect(
        screenshotEventsService.replaceImage('screenshot1', file)
      ).rejects.toThrow('Error message');
    });

    it('should throw default error when no error message is provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve(''),
      });

      const file = new File([''], 'test.png', { type: 'image/png' });
      await expect(
        screenshotEventsService.replaceImage('screenshot1', file)
      ).rejects.toThrow('Failed to replace image');
    });
  });
});
