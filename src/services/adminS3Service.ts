import { api } from './api';

export enum EventType {
  PageView = 'pageview',
  TrackEventWithPageView = 'trackevent_pageview',
  TrackEvent = 'trackevent',
  Outlink = 'outlink',
  BackendEvent = 'backendevent',
}

export enum ScreenshotStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Screenshot {
  id: string;
  name: string;
  url: string;
  pageName: string;
  createdAt: string;
  updatedAt: string;
  status: ScreenshotStatus;
  events?: Event[];
}

export interface Module {
  id: string;
  name: string;
  key: string;
  screenshots: Screenshot[];
  screenshotOrder?: string[]; // Array of screenshot IDs in order
}

export interface Event {
  id: string;
  coordinates: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  screenshotId: string;
  eventType: EventType;
  name: string;
  category: string;
  action: string;
  value: string;
  dimensions: string[];
  updatedAt: string;
  description?: string;
}

export interface PageView {
  id: string;
  url: string;
  title: string;
}

export interface Dimension {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export interface DimensionType {
  id: string;
  name: string;
}

const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

const extractData = <T>(data: any, key: string): T[] => {
  if (data && typeof data === 'object' && key in data) {
    return ensureArray<T>(data[key]);
  }
  return [];
};

const calculateEventCounts = (screenshots: Screenshot[]) => {
  let pageView = 0;
  let trackEventWithPageView = 0;
  let trackEvent = 0;
  let outlink = 0;

  screenshots.forEach((screenshot) => {
    const events = screenshot.events || [];
    events.forEach((event) => {
      switch (event.eventType) {
        case EventType.PageView:
          pageView++;
          break;
        case EventType.TrackEventWithPageView:
          trackEventWithPageView++;
          break;
        case EventType.TrackEvent:
        case EventType.BackendEvent:
          trackEvent++;
          break;
        case EventType.Outlink:
          outlink++;
          break;
      }
    });
  });

  return {
    [EventType.PageView]: pageView,
    [EventType.TrackEventWithPageView]: trackEventWithPageView,
    [EventType.TrackEvent]: trackEvent,
    [EventType.Outlink]: outlink,
  };
};

export const adminS3Service = {
  // Modules
  fetchModules: async () => {
    const data = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(data, 'modules');

    // Sort screenshots based on screenshotOrder if it exists
    return modules.map((module) => ({
      ...module,
      screenshots: module.screenshotOrder
        ? module.screenshotOrder
            .map((id) => module.screenshots.find((s) => s.id === id))
            .filter((s): s is Screenshot => s !== undefined)
            .concat(
              // Add any screenshots not in the order at the end
              module.screenshots.filter(
                (s) => !module.screenshotOrder?.includes(s.id)
              )
            )
        : module.screenshots,
    }));
  },

  fetchModuleEventCounts: async (modules: Module[]) => {
    const eventsData = await api.get<{ events: Event[] }>('events');
    const events = extractData<Event>(eventsData, 'events');

    return modules.map((module) => ({
      ...module,
      screenshots: module.screenshots.map((screenshot) => ({
        ...screenshot,
        events: events.filter((event) => event.screenshotId === screenshot.id),
      })),
      eventCounts: calculateEventCounts(
        module.screenshots.map((screenshot) => ({
          ...screenshot,
          events: events.filter(
            (event) => event.screenshotId === screenshot.id
          ),
        }))
      ),
    }));
  },

  createModule: async (name: string) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const existingData = await api.get<any>('modules');
    const modules = extractData<Module>(response, 'modules');

    const newModule: Module = {
      id: (modules.length + 1).toString(),
      name,
      key: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      screenshots: [],
    };

    return api.update<any>('modules', {
      ...existingData,
      modules: [...modules, newModule],
    });
  },
  deleteModule: async (key: string) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(response, 'modules');
    const filteredModules = modules.filter((module) => module.key !== key);
    return api.update<{ modules: Module[] }>('modules', {
      modules: filteredModules,
    });
  },
  updateModule: async (key: string, name: string) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(response, 'modules');
    const updatedModules = modules.map((module) =>
      module.key === key
        ? {
            ...module,
            name,
            key: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          }
        : module
    );
    return api.update<{ modules: Module[] }>('modules', {
      modules: updatedModules,
    });
  },

  // Page Views
  fetchPageViews: async () => {
    const data = await api.get<{ pageViews: PageView[] }>('page-data');
    return extractData<PageView>(data, 'pageViews');
  },
  createPageView: async (data: { title: string; url: string }) => {
    const response = await api.get<{ pageViews: PageView[] }>('page-data');
    const existingData = await api.get<any>('page-data');
    const pageViews = extractData<PageView>(response, 'pageViews');

    const newPageView: PageView = {
      id: (pageViews.length + 1).toString(),
      title: data.title,
      url: data.url,
    };

    // Maintain existing data structure and just update pageViews array
    return api.update<any>('page-data', {
      ...existingData,
      pageViews: [...pageViews, newPageView],
    });
  },
  deletePageView: async (id: string) => {
    const response = await api.get<{ pageViews: PageView[] }>('page-data');
    const pageViews = extractData<PageView>(response, 'pageViews');
    const filteredPageViews = pageViews.filter(
      (pageView) => pageView.id !== id
    );
    return api.update<{ pageViews: PageView[] }>('page-data', {
      pageViews: filteredPageViews,
    });
  },
  updatePageView: async (id: string, data: { title: string; url: string }) => {
    const response = await api.get<{ pageViews: PageView[] }>('page-data');
    const pageViews = extractData<PageView>(response, 'pageViews');
    const updatedPageViews = pageViews.map((pageView) =>
      pageView.id === id ? { ...pageView, ...data } : pageView
    );
    return api.update<{ pageViews: PageView[] }>('page-data', {
      pageViews: updatedPageViews,
    });
  },

  // Dimensions
  fetchDimensions: async () => {
    const data = await api.get<{ dimensions: Dimension[] }>('dimensions');
    return extractData<Dimension>(data, 'dimensions');
  },
  createDimension: async (data: {
    id: string;
    name: string;
    description?: string;
    type: string;
  }) => {
    const response = await api.get<{ dimensions: Dimension[] }>('dimensions');
    const existingData = await api.get<any>('dimensions');
    const dimensions = extractData<Dimension>(response, 'dimensions');

    const newDimension: Dimension = {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
    };

    return api.update<any>('dimensions', {
      ...existingData,
      dimensions: [...dimensions, newDimension],
    });
  },
  deleteDimension: async (id: string) => {
    const response = await api.get<{ dimensions: Dimension[] }>('dimensions');
    const dimensions = extractData<Dimension>(response, 'dimensions');
    const filteredDimensions = dimensions.filter(
      (dimension) => dimension.id !== id
    );
    return api.update<{ dimensions: Dimension[] }>('dimensions', {
      dimensions: filteredDimensions,
    });
  },
  updateDimension: async (
    id: string,
    data: { name: string; description?: string; type: string }
  ) => {
    const response = await api.get<{ dimensions: Dimension[] }>('dimensions');
    const dimensions = extractData<Dimension>(response, 'dimensions');
    const updatedDimensions = dimensions.map((dimension) =>
      dimension.id === id ? { ...dimension, ...data } : dimension
    );
    return api.update<{ dimensions: Dimension[] }>('dimensions', {
      dimensions: updatedDimensions,
    });
  },

  // Event Categories
  fetchEventCategories: async () => {
    const data = await api.get<{ eventCategory: string[] }>('event-categories');
    return data?.eventCategory || [];
  },
  createEventCategory: async (name: string) => {
    const response = await api.get<{ eventCategory: string[] }>(
      'event-categories'
    );
    const categories = response?.eventCategory || [];

    return api.update('event-categories', {
      eventCategory: [...categories, name],
    });
  },
  deleteEventCategory: async (name: string) => {
    const response = await api.get<{ eventCategory: string[] }>(
      'event-categories'
    );
    const categories = response?.eventCategory || [];

    return api.update('event-categories', {
      eventCategory: categories.filter((category) => category !== name),
    });
  },
  updateEventCategory: async (oldName: string, newName: string) => {
    const response = await api.get<{ eventCategory: string[] }>(
      'event-categories'
    );
    const categories = response?.eventCategory || [];
    const updatedCategories = categories.map((category) =>
      category === oldName ? newName : category
    );
    return api.update('event-categories', { eventCategory: updatedCategories });
  },

  // Event Actions
  fetchEventActions: async () => {
    const data = await api.get<{ eventAction: string[] }>('event-actions');
    return data?.eventAction || [];
  },
  createEventAction: async (name: string) => {
    const response = await api.get<{ eventAction: string[] }>('event-actions');
    const actions = response?.eventAction || [];

    return api.update('event-actions', {
      eventAction: [...actions, name],
    });
  },
  deleteEventAction: async (name: string) => {
    const response = await api.get<{ eventAction: string[] }>('event-actions');
    const actions = response?.eventAction || [];

    return api.update('event-actions', {
      eventAction: actions.filter((action) => action !== name),
    });
  },
  updateEventAction: async (oldName: string, newName: string) => {
    const response = await api.get<{ eventAction: string[] }>('event-actions');
    const actions = response?.eventAction || [];
    const updatedActions = actions.map((action) =>
      action === oldName ? newName : action
    );
    return api.update('event-actions', { eventAction: updatedActions });
  },

  // Event Names
  fetchEventNames: async () => {
    const data = await api.get<{ eventNames: string[] }>('event-names');
    return data?.eventNames || [];
  },
  createEventName: async (name: string) => {
    const response = await api.get<{ eventNames: string[] }>('event-names');
    const names = response?.eventNames || [];

    return api.update('event-names', {
      eventNames: [...names, name],
    });
  },
  deleteEventName: async (name: string) => {
    const response = await api.get<{ eventNames: string[] }>('event-names');
    const names = response?.eventNames || [];

    return api.update('event-names', {
      eventNames: names.filter((eventName) => eventName !== name),
    });
  },
  updateEventName: async (oldName: string, newName: string) => {
    const response = await api.get<{ eventNames: string[] }>('event-names');
    const names = response?.eventNames || [];
    const updatedNames = names.map((name) =>
      name === oldName ? newName : name
    );
    return api.update('event-names', { eventNames: updatedNames });
  },

  // Screenshots
  deleteScreenshot: async (screenshotId: string) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(response, 'modules');

    // Find the module and screenshot
    let targetModule: Module | undefined;
    let screenshot;

    for (const mod of modules) {
      screenshot = mod.screenshots.find((s) => s.id === screenshotId);
      if (screenshot) {
        targetModule = mod;
        break;
      }
    }

    if (!targetModule || !screenshot) {
      throw new Error('Screenshot not found');
    }

    // Delete from S3 first
    await api.delete(`screenshots/${screenshotId}`);

    // Then update modules data
    const updatedModules = modules.map((module) => ({
      ...module,
      screenshots: module.screenshots.filter((s) => s.id !== screenshotId),
    }));

    return api.update('modules', { modules: updatedModules });
  },
  updateScreenshotStatus: async (
    screenshotId: string,
    status: ScreenshotStatus
  ) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(response, 'modules');

    // Find and update the screenshot status
    const updatedModules = modules.map((module) => ({
      ...module,
      screenshots: module.screenshots.map((screenshot) =>
        screenshot.id === screenshotId
          ? { ...screenshot, status, updatedAt: new Date().toISOString() }
          : screenshot
      ),
    }));

    return api.update('modules', { modules: updatedModules });
  },
  updateScreenshotName: async (screenshotId: string, newName: string) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(response, 'modules');

    // Find and update the screenshot name
    const updatedModules = modules.map((module) => ({
      ...module,
      screenshots: module.screenshots.map((screenshot) =>
        screenshot.id === screenshotId
          ? {
              ...screenshot,
              name: newName,
              updatedAt: new Date().toISOString(),
            }
          : screenshot
      ),
    }));

    return api.update('modules', { modules: updatedModules });
  },
  replaceScreenshot: async (
    screenshotId: string,
    file: File
  ): Promise<void> => {
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

  // Events
  fetchEvents: async (screenshotId: string): Promise<Event[]> => {
    const data = await api.get<{ events: Event[] }>('events');
    const events = data.events || [];
    return events.filter((event) => event.screenshotId === screenshotId);
  },

  createEvent: async (event: Event): Promise<Event> => {
    const data = await api.get<{ events: Event[] }>('events');
    const events = data.events || [];
    events.push(event);
    await api.update('events', { events });
    return event;
  },

  updateEvent: async (event: Event): Promise<Event> => {
    const data = await api.get<{ events: Event[] }>('events');
    const events = data.events || [];
    const updatedEvents = events.map((e) => (e.id === event.id ? event : e));
    await api.update('events', { events: updatedEvents });
    return event;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    const data = await api.get<{ events: Event[] }>('events');
    const events = data.events || [];
    const updatedEvents = events.filter((e) => e.id !== eventId);
    await api.update('events', { events: updatedEvents });
  },

  // Dropdowns
  fetchDropdownData: async () => {
    const [pageViews, dimensions, eventCategories, eventActions, eventNames] =
      await Promise.all([
        adminS3Service.fetchPageViews(),
        adminS3Service.fetchDimensions(),
        adminS3Service.fetchEventCategories(),
        adminS3Service.fetchEventActions(),
        adminS3Service.fetchEventNames(),
      ]);

    return {
      pageData: pageViews,
      dimensions: dimensions,
      eventCategories: eventCategories,
      eventActionNames: eventActions,
      eventNames: eventNames,
    };
  },

  // Dimension Types
  fetchDimensionTypes: async () => {
    try {
      const data = await api.get<{ types: DimensionType[] }>('dimension-types');
      return data?.types || [];
    } catch (error) {
      // If file doesn't exist, return empty array
      return [];
    }
  },

  createDimensionType: async (type: DimensionType) => {
    try {
      const response = await api.get<{ types: DimensionType[] }>(
        'dimension-types'
      );
      const types = response?.types || [];
      return api.update('dimension-types', {
        types: [...types, type],
      });
    } catch (error) {
      // If file doesn't exist, create it with the new type
      return api.update('dimension-types', {
        types: [type],
      });
    }
  },

  deleteDimensionType: async (typeId: string) => {
    // First, get and update dimension types
    const response = await api.get<{ types: DimensionType[] }>(
      'dimension-types'
    );
    const types = response?.types || [];
    const updatedTypes = types.filter((t) => t.id !== typeId);
    await api.update('dimension-types', {
      types: updatedTypes,
    });

    // Then, update all dimensions that use this type (set their type to empty string or null)
    const dimensionsResponse = await api.get<{ dimensions: Dimension[] }>(
      'dimensions'
    );
    const dimensions = dimensionsResponse?.dimensions || [];
    const updatedDimensions = dimensions.map((dimension) =>
      dimension.type === typeId ? { ...dimension, type: '' } : dimension
    );
    await api.update('dimensions', {
      dimensions: updatedDimensions,
    });

    return { types: updatedTypes, dimensions: updatedDimensions };
  },

  updateDimensionType: async (oldTypeId: string, type: DimensionType) => {
    // First, update the dimension type
    const response = await api.get<{ types: DimensionType[] }>(
      'dimension-types'
    );
    const types = response?.types || [];
    const updatedTypes = types.map((t) => (t.id === oldTypeId ? type : t));
    await api.update('dimension-types', {
      types: updatedTypes,
    });

    // Then, update all dimensions that use this type
    const dimensionsResponse = await api.get<{ dimensions: Dimension[] }>(
      'dimensions'
    );
    const dimensions = dimensionsResponse?.dimensions || [];
    const updatedDimensions = dimensions.map((dimension) =>
      dimension.type === oldTypeId ? { ...dimension, type: type.id } : dimension
    );
    await api.update('dimensions', {
      dimensions: updatedDimensions,
    });

    return { types: updatedTypes, dimensions: updatedDimensions };
  },

  updateScreenshotOrder: async (moduleKey: string, newOrder: string[]) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const modules = extractData<Module>(response, 'modules');

    const updatedModules = modules.map((module) =>
      module.key === moduleKey
        ? {
            ...module,
            screenshotOrder: newOrder,
            screenshots: newOrder.map(
              (id) => module.screenshots.find((s) => s.id === id)!
            ),
          }
        : module
    );

    return api.update<{ modules: Module[] }>('modules', {
      modules: updatedModules,
    });
  },
};
