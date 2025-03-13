import { EEventType } from '@/services/adminS3Service';

// Mock data
const mockEvents = [
  {
    id: 'event-1',
    coordinates: {
      startX: 100,
      startY: 100,
      width: 200,
      height: 100,
    },
    screenshotId: 'mock-screenshot-id',
    eventType: EEventType.PageView,
    name: 'Home Page',
    category: 'Navigation',
    action: 'View',
    value: '',
    dimensions: ['dimension1'],
    description: 'This is a page view event',
  },
  {
    id: 'event-2',
    coordinates: {
      startX: 400,
      startY: 200,
      width: 150,
      height: 80,
    },
    screenshotId: 'mock-screenshot-id',
    eventType: EEventType.TrackEvent,
    name: 'Button Click',
    category: 'Interaction',
    action: 'Click',
    value: 'submit',
    dimensions: ['dimension2'],
    description: 'This is a track event',
  },
];

const mockModules = [
  {
    id: 'mock-module-id',
    name: 'Test Module',
    key: 'test-module',
    screenshots: [
      {
        id: 'mock-screenshot-id',
        name: 'Test Screenshot',
        url: 'https://example.com/test.jpg',
        pageName: 'Test Page',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        status: 'DONE',
        events: [],
      },
    ],
  },
];

// Mock service
export const adminS3Service = {
  fetchEvents: jest.fn().mockImplementation((screenshotId) => {
    return Promise.resolve(
      mockEvents.filter((e) => e.screenshotId === screenshotId)
    );
  }),
  fetchModules: jest.fn().mockImplementation(() => {
    return Promise.resolve(mockModules);
  }),
  createEvent: jest.fn().mockImplementation((eventData) => {
    return Promise.resolve({ ...eventData, id: Date.now().toString() });
  }),
  updateEvent: jest.fn().mockImplementation((eventData) => {
    return Promise.resolve(eventData);
  }),
  deleteEvent: jest.fn().mockImplementation((eventId) => {
    return Promise.resolve({ success: true });
  }),
};

// Export EEventType enum for use in tests
export { EEventType };
