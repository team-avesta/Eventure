import {
  adminS3Service,
  Module,
  EEventType,
  ScreenshotStatus,
  PageView,
  Dimension,
  DimensionType,
} from '@/services/adminS3Service';
import { api } from '@/services/api';

jest.mock('@/services/api');

describe('adminS3Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockModule: Module = {
    id: '1',
    name: 'Test Module',
    key: 'test_module',
    screenshots: [
      {
        id: '1',
        name: 'Test Screenshot',
        url: 'test.jpg',
        pageName: 'test_module',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        status: ScreenshotStatus.TODO,
        events: [
          {
            id: '1',
            screenshotId: '1',
            coordinates: { startX: 0, startY: 0, width: 100, height: 100 },
            eventType: EEventType.PageView,
            name: 'Test Event',
            category: 'Test Category',
            action: 'Test Action',
            value: 'Test Value',
            dimensions: ['dim1'],
            updatedAt: '2024-01-01',
            description: 'Test Description',
          },
        ],
      },
    ],
    screenshotOrder: ['1'],
  };

  const mockPageView: PageView = {
    id: '1',
    url: '/test',
    title: 'Test Page',
  };

  const mockDimension: Dimension = {
    id: 'dim1',
    name: 'Test Dimension',
    description: 'Test Description',
    type: 'test_type',
  };

  const mockDimensionType: DimensionType = {
    id: 'test_type',
    name: 'Test Type',
  };

  describe('Module Operations', () => {
    describe('fetchModules', () => {
      it('should fetch modules successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        const modules = await adminS3Service.fetchModules();
        expect(modules).toEqual([mockModule]);
        expect(api.get).toHaveBeenCalledWith('modules');
      });

      it('should return empty array when no modules exist', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({});

        const modules = await adminS3Service.fetchModules();
        expect(modules).toEqual([]);
      });
    });

    describe('fetchModuleEventCounts', () => {
      it('should fetch and calculate event counts correctly', async () => {
        const mockEvents = [
          {
            id: '1',
            screenshotId: '1',
            eventType: EEventType.PageView,
          },
          {
            id: '2',
            screenshotId: '1',
            eventType: EEventType.TrackEventWithPageView,
          },
        ];

        (api.get as jest.Mock).mockResolvedValueOnce({ events: mockEvents });

        const result = await adminS3Service.fetchModuleEventCounts([
          mockModule,
        ]);
        const expectedCounts = {
          [EEventType.PageView]: 1,
          [EEventType.TrackEventWithPageView]: 1,
          [EEventType.TrackEvent]: 0,
          [EEventType.Outlink]: 0,
        };
        expect(result[0].eventCounts).toEqual(expectedCounts);
      });
    });

    describe('createModule', () => {
      it('should create a module successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.createModule('New Module');

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            mockModule,
            {
              id: '2',
              name: 'New Module',
              key: 'new_module',
              screenshots: [],
            },
          ],
        });
      });
    });

    describe('deleteModule', () => {
      it('should delete a module successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.deleteModule('test_module');

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [],
        });
      });
    });

    describe('updateModule', () => {
      it('should update a module successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.updateModule('test_module', 'Updated Module');

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModule,
              name: 'Updated Module',
              key: 'updated_module',
            },
          ],
        });
      });

      it('should not update other modules', async () => {
        const otherModule = { ...mockModule, id: '2', key: 'other_module' };
        (api.get as jest.Mock).mockResolvedValueOnce({
          modules: [mockModule, otherModule],
        });

        await adminS3Service.updateModule('test_module', 'Updated Module');

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModule,
              name: 'Updated Module',
              key: 'updated_module',
            },
            otherModule,
          ],
        });
      });
    });
  });

  describe('Page View Operations', () => {
    describe('fetchPageViews', () => {
      it('should fetch page views successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          pageViews: [mockPageView],
        });

        const pageViews = await adminS3Service.fetchPageViews();
        expect(pageViews).toEqual([mockPageView]);
        expect(api.get).toHaveBeenCalledWith('page-data');
      });

      it('should return empty array when no page views exist', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({});

        const pageViews = await adminS3Service.fetchPageViews();
        expect(pageViews).toEqual([]);
      });
    });

    describe('createPageView', () => {
      it('should create a page view successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          pageViews: [mockPageView],
        });

        const newPageView = {
          title: 'New Page',
          url: '/new',
        };

        await adminS3Service.createPageView(newPageView);

        expect(api.update).toHaveBeenCalledWith('page-data', {
          pageViews: [
            mockPageView,
            {
              id: '2',
              ...newPageView,
            },
          ],
        });
      });
    });

    describe('deletePageView', () => {
      it('should delete a page view successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          pageViews: [mockPageView],
        });

        await adminS3Service.deletePageView('1');

        expect(api.update).toHaveBeenCalledWith('page-data', {
          pageViews: [],
        });
      });

      it('should not delete other page views', async () => {
        const otherPageView = { ...mockPageView, id: '2' };
        (api.get as jest.Mock).mockResolvedValueOnce({
          pageViews: [mockPageView, otherPageView],
        });

        await adminS3Service.deletePageView('1');

        expect(api.update).toHaveBeenCalledWith('page-data', {
          pageViews: [otherPageView],
        });
      });
    });

    describe('updatePageView', () => {
      it('should update a page view successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          pageViews: [mockPageView],
        });

        const updatedData = {
          title: 'Updated Page',
          url: '/updated',
        };

        await adminS3Service.updatePageView('1', updatedData);

        expect(api.update).toHaveBeenCalledWith('page-data', {
          pageViews: [
            {
              ...mockPageView,
              ...updatedData,
            },
          ],
        });
      });

      it('should not update other page views', async () => {
        const otherPageView = { ...mockPageView, id: '2' };
        (api.get as jest.Mock).mockResolvedValueOnce({
          pageViews: [mockPageView, otherPageView],
        });

        const updatedData = {
          title: 'Updated Page',
          url: '/updated',
        };

        await adminS3Service.updatePageView('1', updatedData);

        expect(api.update).toHaveBeenCalledWith('page-data', {
          pageViews: [
            {
              ...mockPageView,
              ...updatedData,
            },
            otherPageView,
          ],
        });
      });
    });
  });

  describe('Dimension Operations', () => {
    describe('fetchDimensions', () => {
      it('should fetch dimensions successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          dimensions: [mockDimension],
        });

        const dimensions = await adminS3Service.fetchDimensions();
        expect(dimensions).toEqual([mockDimension]);
        expect(api.get).toHaveBeenCalledWith('dimensions');
      });

      it('should return empty array when no dimensions exist', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({});

        const dimensions = await adminS3Service.fetchDimensions();
        expect(dimensions).toEqual([]);
      });
    });

    describe('createDimension', () => {
      it('should create a dimension successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          dimensions: [mockDimension],
        });

        const newDimension = {
          id: 'dim2',
          name: 'New Dimension',
          description: 'New Description',
          type: 'test_type',
        };

        await adminS3Service.createDimension(newDimension);

        expect(api.update).toHaveBeenCalledWith('dimensions', {
          dimensions: [mockDimension, newDimension],
        });
      });
    });

    describe('deleteDimension', () => {
      it('should delete a dimension successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          dimensions: [mockDimension],
        });

        await adminS3Service.deleteDimension('dim1');

        expect(api.update).toHaveBeenCalledWith('dimensions', {
          dimensions: [],
        });
      });

      it('should not delete other dimensions', async () => {
        const otherDimension = { ...mockDimension, id: 'dim2' };
        (api.get as jest.Mock).mockResolvedValueOnce({
          dimensions: [mockDimension, otherDimension],
        });

        await adminS3Service.deleteDimension('dim1');

        expect(api.update).toHaveBeenCalledWith('dimensions', {
          dimensions: [otherDimension],
        });
      });
    });

    describe('updateDimension', () => {
      it('should update a dimension successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          dimensions: [mockDimension],
        });

        const updatedData = {
          name: 'Updated Dimension',
          description: 'Updated Description',
          type: 'updated_type',
        };

        await adminS3Service.updateDimension('dim1', updatedData);

        expect(api.update).toHaveBeenCalledWith('dimensions', {
          dimensions: [
            {
              ...mockDimension,
              ...updatedData,
            },
          ],
        });
      });
    });
  });

  describe('Dimension Type Operations', () => {
    describe('fetchDimensionTypes', () => {
      it('should fetch dimension types successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          types: [mockDimensionType],
        });

        const types = await adminS3Service.fetchDimensionTypes();
        expect(types).toEqual([mockDimensionType]);
        expect(api.get).toHaveBeenCalledWith('dimension-types');
      });

      it('should return empty array when file does not exist', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce(new Error());

        const types = await adminS3Service.fetchDimensionTypes();
        expect(types).toEqual([]);
      });
    });

    describe('createDimensionType', () => {
      it('should create a dimension type successfully when file exists', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          types: [mockDimensionType],
        });

        const newType = {
          id: 'new_type',
          name: 'New Type',
        };

        await adminS3Service.createDimensionType(newType);

        expect(api.update).toHaveBeenCalledWith('dimension-types', {
          types: [mockDimensionType, newType],
        });
      });

      it('should create file with new type when file does not exist', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce(new Error());

        const newType = {
          id: 'new_type',
          name: 'New Type',
        };

        await adminS3Service.createDimensionType(newType);

        expect(api.update).toHaveBeenCalledWith('dimension-types', {
          types: [newType],
        });
      });
    });

    describe('deleteDimensionType', () => {
      it('should delete a dimension type and update related dimensions', async () => {
        (api.get as jest.Mock)
          .mockResolvedValueOnce({ types: [mockDimensionType] })
          .mockResolvedValueOnce({ dimensions: [mockDimension] });

        await adminS3Service.deleteDimensionType('test_type');

        expect(api.update).toHaveBeenCalledWith('dimension-types', {
          types: [],
        });

        expect(api.update).toHaveBeenCalledWith('dimensions', {
          dimensions: [{ ...mockDimension, type: '' }],
        });
      });
    });

    describe('updateDimensionType', () => {
      it('should update a dimension type and related dimensions', async () => {
        (api.get as jest.Mock)
          .mockResolvedValueOnce({ types: [mockDimensionType] })
          .mockResolvedValueOnce({ dimensions: [mockDimension] });

        const updatedType = {
          id: 'updated_type',
          name: 'Updated Type',
        };

        await adminS3Service.updateDimensionType('test_type', updatedType);

        expect(api.update).toHaveBeenCalledWith('dimension-types', {
          types: [updatedType],
        });

        expect(api.update).toHaveBeenCalledWith('dimensions', {
          dimensions: [{ ...mockDimension, type: 'updated_type' }],
        });
      });
    });
  });

  describe('Event Category Operations', () => {
    const mockCategories = ['Category 1', 'Category 2'];

    describe('fetchEventCategories', () => {
      it('should fetch event categories successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventCategory: mockCategories,
        });

        const categories = await adminS3Service.fetchEventCategories();
        expect(categories).toEqual(mockCategories);
        expect(api.get).toHaveBeenCalledWith('event-categories');
      });

      it('should return empty array when no categories exist', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({});

        const categories = await adminS3Service.fetchEventCategories();
        expect(categories).toEqual([]);
      });
    });

    describe('createEventCategory', () => {
      it('should create an event category successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventCategory: mockCategories,
        });

        await adminS3Service.createEventCategory('New Category');

        expect(api.update).toHaveBeenCalledWith('event-categories', {
          eventCategory: [...mockCategories, 'New Category'],
        });
      });
    });

    describe('deleteEventCategory', () => {
      it('should delete an event category successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventCategory: mockCategories,
        });

        await adminS3Service.deleteEventCategory('Category 1');

        expect(api.update).toHaveBeenCalledWith('event-categories', {
          eventCategory: ['Category 2'],
        });
      });
    });

    describe('updateEventCategory', () => {
      it('should update an event category successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventCategory: mockCategories,
        });

        await adminS3Service.updateEventCategory(
          'Category 1',
          'Updated Category'
        );

        expect(api.update).toHaveBeenCalledWith('event-categories', {
          eventCategory: ['Updated Category', 'Category 2'],
        });
      });
    });
  });

  describe('Event Action Operations', () => {
    const mockActions = ['Action 1', 'Action 2'];

    describe('fetchEventActions', () => {
      it('should fetch event actions successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventAction: mockActions,
        });

        const actions = await adminS3Service.fetchEventActions();
        expect(actions).toEqual(mockActions);
        expect(api.get).toHaveBeenCalledWith('event-actions');
      });

      it('should return empty array when no actions exist', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({});

        const actions = await adminS3Service.fetchEventActions();
        expect(actions).toEqual([]);
      });
    });

    describe('createEventAction', () => {
      it('should create an event action successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventAction: mockActions,
        });

        await adminS3Service.createEventAction('New Action');

        expect(api.update).toHaveBeenCalledWith('event-actions', {
          eventAction: [...mockActions, 'New Action'],
        });
      });
    });

    describe('deleteEventAction', () => {
      it('should delete an event action successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventAction: mockActions,
        });

        await adminS3Service.deleteEventAction('Action 1');

        expect(api.update).toHaveBeenCalledWith('event-actions', {
          eventAction: ['Action 2'],
        });
      });
    });

    describe('updateEventAction', () => {
      it('should update an event action successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          eventAction: mockActions,
        });

        await adminS3Service.updateEventAction('Action 1', 'Updated Action');

        expect(api.update).toHaveBeenCalledWith('event-actions', {
          eventAction: ['Updated Action', 'Action 2'],
        });
      });
    });
  });

  describe('Event Name Operations', () => {
    const mockNames = ['Name 1', 'Name 2'];

    describe('fetchEventNames', () => {
      it('should fetch event names successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ eventNames: mockNames });

        const names = await adminS3Service.fetchEventNames();
        expect(names).toEqual(mockNames);
        expect(api.get).toHaveBeenCalledWith('event-names');
      });

      it('should return empty array when no names exist', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({});

        const names = await adminS3Service.fetchEventNames();
        expect(names).toEqual([]);
      });
    });

    describe('createEventName', () => {
      it('should create an event name successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ eventNames: mockNames });

        await adminS3Service.createEventName('New Name');

        expect(api.update).toHaveBeenCalledWith('event-names', {
          eventNames: [...mockNames, 'New Name'],
        });
      });
    });

    describe('deleteEventName', () => {
      it('should delete an event name successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ eventNames: mockNames });

        await adminS3Service.deleteEventName('Name 1');

        expect(api.update).toHaveBeenCalledWith('event-names', {
          eventNames: ['Name 2'],
        });
      });
    });

    describe('updateEventName', () => {
      it('should update an event name successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ eventNames: mockNames });

        await adminS3Service.updateEventName('Name 1', 'Updated Name');

        expect(api.update).toHaveBeenCalledWith('event-names', {
          eventNames: ['Updated Name', 'Name 2'],
        });
      });
    });
  });

  describe('Event Operations', () => {
    const mockEvent = {
      id: '1',
      coordinates: {
        startX: 0,
        startY: 0,
        width: 100,
        height: 100,
      },
      screenshotId: '1',
      eventType: EEventType.PageView,
      name: 'Test Event',
      category: 'Test Category',
      action: 'Test Action',
      value: 'Test Value',
      dimensions: ['dim1'],
      updatedAt: '2024-01-01',
      description: 'Test Description',
    };

    describe('createEvent', () => {
      it('should create an event with description successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ events: [] });

        await adminS3Service.createEvent(mockEvent);

        expect(api.update).toHaveBeenCalledWith('events', {
          events: [mockEvent],
        });
      });

      it('should create an event without description successfully', async () => {
        const { description, ...eventWithoutDescription } = mockEvent;

        (api.get as jest.Mock).mockResolvedValueOnce({ events: [] });

        await adminS3Service.createEvent(eventWithoutDescription);

        expect(api.update).toHaveBeenCalledWith('events', {
          events: [eventWithoutDescription],
        });
      });
    });

    describe('updateEvent', () => {
      it('should update event description successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ events: [mockEvent] });

        const updatedEvent = {
          ...mockEvent,
          description: 'Updated Description',
        };

        await adminS3Service.updateEvent(updatedEvent);

        expect(api.update).toHaveBeenCalledWith('events', {
          events: [updatedEvent],
        });
      });

      it('should remove description when updating event', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ events: [mockEvent] });

        const { description, ...updatedEvent } = mockEvent;

        await adminS3Service.updateEvent(updatedEvent);

        expect(api.update).toHaveBeenCalledWith('events', {
          events: [updatedEvent],
        });
      });
    });

    describe('fetchEvents', () => {
      it('should fetch events with descriptions successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({
          events: [mockEvent],
        });

        const events = await adminS3Service.fetchEvents('1');
        expect(events).toEqual([mockEvent]);
        expect(events[0]).toHaveProperty('description', 'Test Description');
      });

      it('should fetch events without descriptions successfully', async () => {
        const { description, ...eventWithoutDescription } = mockEvent;

        (api.get as jest.Mock).mockResolvedValueOnce({
          events: [eventWithoutDescription],
        });

        const events = await adminS3Service.fetchEvents('1');
        expect(events).toEqual([eventWithoutDescription]);
        expect(events[0].description).toBeUndefined();
      });
    });
  });

  describe('Screenshot Operations', () => {
    const mockScreenshot = {
      id: '1',
      name: 'Test Screenshot',
      url: 'test.jpg',
      pageName: 'test_module',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      status: ScreenshotStatus.TODO,
    };

    const mockModule = {
      id: '1',
      name: 'Test Module',
      key: 'test_module',
      screenshots: [mockScreenshot],
      screenshotOrder: ['1'],
    };

    describe('deleteScreenshot', () => {
      it('should delete a screenshot successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.deleteScreenshot('1');

        expect(api.delete).toHaveBeenCalledWith('screenshots/1');
        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModule,
              screenshots: [],
            },
          ],
        });
      });

      it('should throw error when screenshot not found', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await expect(adminS3Service.deleteScreenshot('2')).rejects.toThrow(
          'Screenshot not found'
        );
      });
    });

    describe('updateScreenshotStatus', () => {
      it('should update screenshot status successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.updateScreenshotStatus(
          '1',
          ScreenshotStatus.IN_PROGRESS
        );

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModule,
              screenshots: [
                {
                  ...mockScreenshot,
                  status: ScreenshotStatus.IN_PROGRESS,
                  updatedAt: expect.any(String),
                },
              ],
            },
          ],
        });
      });
    });

    describe('updateScreenshotName', () => {
      it('should update screenshot name successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.updateScreenshotName('1', 'Updated Screenshot');

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModule,
              screenshots: [
                {
                  ...mockScreenshot,
                  name: 'Updated Screenshot',
                  updatedAt: expect.any(String),
                },
              ],
            },
          ],
        });
      });
    });

    describe('updateScreenshotLabel', () => {
      it('should update screenshot label successfully', async () => {
        (api.get as jest.Mock).mockResolvedValueOnce({ modules: [mockModule] });

        await adminS3Service.updateScreenshotLabel('1', 'label1');

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModule,
              screenshots: [
                {
                  ...mockScreenshot,
                  labelId: 'label1',
                  updatedAt: expect.any(String),
                },
              ],
            },
          ],
        });
      });

      it('should remove screenshot label when null is provided', async () => {
        const screenshotWithLabel = {
          ...mockScreenshot,
          labelId: 'existingLabel',
        };
        const moduleWithLabeledScreenshot = {
          ...mockModule,
          screenshots: [screenshotWithLabel],
        };

        (api.get as jest.Mock).mockResolvedValueOnce({
          modules: [moduleWithLabeledScreenshot],
        });

        await adminS3Service.updateScreenshotLabel('1', null);

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...moduleWithLabeledScreenshot,
              screenshots: [
                {
                  ...screenshotWithLabel,
                  labelId: null,
                  updatedAt: expect.any(String),
                },
              ],
            },
          ],
        });
      });
    });

    describe('replaceScreenshot', () => {
      it('should replace screenshot successfully', async () => {
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        const mockFetch = jest.fn().mockResolvedValueOnce({ ok: true });
        global.fetch = mockFetch;

        await adminS3Service.replaceScreenshot('1', mockFile);

        expect(mockFetch).toHaveBeenCalledWith('/api/s3/screenshots/replace', {
          method: 'POST',
          body: expect.any(FormData),
        });
      });

      it('should throw error when replacement fails', async () => {
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        const mockFetch = jest.fn().mockResolvedValueOnce({
          ok: false,
          text: () => Promise.resolve('Error message'),
        });
        global.fetch = mockFetch;

        await expect(
          adminS3Service.replaceScreenshot('1', mockFile)
        ).rejects.toThrow('Error message');
      });
    });

    describe('updateScreenshotOrder', () => {
      it('should update screenshot order successfully', async () => {
        const mockScreenshots = [
          { ...mockScreenshot, id: '1' },
          { ...mockScreenshot, id: '2' },
          { ...mockScreenshot, id: '3' },
        ];
        const mockModuleWithMultipleScreenshots = {
          ...mockModule,
          screenshots: mockScreenshots,
          screenshotOrder: ['1', '2', '3'],
        };

        (api.get as jest.Mock).mockResolvedValueOnce({
          modules: [mockModuleWithMultipleScreenshots],
        });

        const newOrder = ['3', '1', '2'];
        await adminS3Service.updateScreenshotOrder('test_module', newOrder);

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModuleWithMultipleScreenshots,
              screenshotOrder: newOrder,
              screenshots: [
                mockScreenshots[2],
                mockScreenshots[0],
                mockScreenshots[1],
              ],
            },
          ],
        });
      });

      it('should not affect other modules when updating order', async () => {
        const otherModule = {
          ...mockModule,
          key: 'other_module',
          id: '2',
        };

        const mockScreenshots = [
          { ...mockScreenshot, id: '1' },
          { ...mockScreenshot, id: '2' },
        ];
        const mockModuleWithMultipleScreenshots = {
          ...mockModule,
          screenshots: mockScreenshots,
          screenshotOrder: ['1', '2'],
        };

        (api.get as jest.Mock).mockResolvedValueOnce({
          modules: [mockModuleWithMultipleScreenshots, otherModule],
        });

        const newOrder = ['2', '1'];
        await adminS3Service.updateScreenshotOrder('test_module', newOrder);

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModuleWithMultipleScreenshots,
              screenshotOrder: newOrder,
              screenshots: [mockScreenshots[1], mockScreenshots[0]],
            },
            otherModule,
          ],
        });
      });

      it('should maintain screenshot data integrity when reordering', async () => {
        const mockScreenshots = [
          { ...mockScreenshot, id: '1', name: 'First' },
          { ...mockScreenshot, id: '2', name: 'Second' },
        ];
        const mockModuleWithMultipleScreenshots = {
          ...mockModule,
          screenshots: mockScreenshots,
          screenshotOrder: ['1', '2'],
        };

        (api.get as jest.Mock).mockResolvedValueOnce({
          modules: [mockModuleWithMultipleScreenshots],
        });

        const newOrder = ['2', '1'];
        await adminS3Service.updateScreenshotOrder('test_module', newOrder);

        expect(api.update).toHaveBeenCalledWith('modules', {
          modules: [
            {
              ...mockModuleWithMultipleScreenshots,
              screenshotOrder: newOrder,
              screenshots: [
                { ...mockScreenshot, id: '2', name: 'Second' },
                { ...mockScreenshot, id: '1', name: 'First' },
              ],
            },
          ],
        });
      });
    });
  });
});
