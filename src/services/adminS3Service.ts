import { api } from './api';

export interface Screenshot {
  id: string;
  name: string;
  url: string;
  pageName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  key: string;
  screenshots: Screenshot[];
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
  eventType: string;
  name: string;
  category: string;
  action: string;
  value: string;
  dimensions: string[];
}

export interface PageView {
  id: string;
  url: string;
  title: string;
}

export interface Dimension {
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

export const adminS3Service = {
  // Modules
  fetchModules: async () => {
    const data = await api.get<{ modules: Module[] }>('modules');
    return extractData<Module>(data, 'modules');
  },
  createModule: async (name: string) => {
    const response = await api.get<{ modules: Module[] }>('modules');
    const existingData = await api.get<any>('modules');
    const modules = extractData<Module>(response, 'modules');

    const newModule: Module = {
      id: (modules.length + 1).toString(),
      name,
      key: name.toLowerCase().replace(/\s+/g, '_'),
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

  // Dimensions
  fetchDimensions: async () => {
    const data = await api.get<{ dimensions: Dimension[] }>('dimensions');
    return extractData<Dimension>(data, 'dimensions');
  },
  createDimension: async (data: { id: string; name: string }) => {
    const response = await api.get<{ dimensions: Dimension[] }>('dimensions');
    const existingData = await api.get<any>('dimensions');
    const dimensions = extractData<Dimension>(response, 'dimensions');

    const newDimension: Dimension = {
      id: data.id,
      name: data.name,
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
};
