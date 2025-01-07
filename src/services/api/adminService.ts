import PATHS from '@/constants/apiPaths';

// Interfaces
interface Module {
  name: string;
  key: string;
}

interface PageView {
  id: string;
  url: string;
  title: string;
}

interface Dimension {
  id: string;
  name: string;
}

interface EventCategory {
  name: string;
}

interface EventAction {
  name: string;
}

interface EventName {
  name: string;
}

class AdminService {
  // Modules
  async fetchModules(): Promise<Module[]> {
    const response = await fetch(PATHS.admin.modules);
    if (!response.ok) {
      throw new Error('Failed to fetch modules');
    }
    return response.json();
  }

  async deleteModule(moduleId: string): Promise<void> {
    const response = await fetch(`${PATHS.admin.modules}/${moduleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete module');
    }
  }

  // Page Views
  async fetchPageViews(): Promise<PageView[]> {
    const response = await fetch(PATHS.admin.pageViews);
    if (!response.ok) {
      throw new Error('Failed to fetch page views');
    }
    return response.json();
  }

  async deletePageView(pageViewId: string): Promise<void> {
    const response = await fetch(`${PATHS.admin.pageViews}/${pageViewId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete page view');
    }
  }

  // Dimensions
  async fetchDimensions(): Promise<Dimension[]> {
    const response = await fetch(PATHS.admin.dimensions);
    if (!response.ok) {
      throw new Error('Failed to fetch dimensions');
    }
    return response.json();
  }

  async deleteDimension(dimensionId: string): Promise<void> {
    const response = await fetch(`${PATHS.admin.dimensions}/${dimensionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete dimension');
    }
  }

  // Event Categories
  async fetchEventCategories(): Promise<EventCategory[]> {
    const response = await fetch(PATHS.admin.eventCategories);
    if (!response.ok) {
      throw new Error('Failed to fetch event categories');
    }
    return response.json();
  }

  async deleteEventCategory(categoryName: string): Promise<void> {
    const response = await fetch(
      `${PATHS.admin.eventCategories}/${categoryName}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete event category');
    }
  }

  // Event Actions
  async fetchEventActions(): Promise<EventAction[]> {
    const response = await fetch(PATHS.admin.eventActions);
    if (!response.ok) {
      throw new Error('Failed to fetch event actions');
    }
    return response.json();
  }

  async deleteEventAction(actionName: string): Promise<void> {
    const response = await fetch(`${PATHS.admin.eventActions}/${actionName}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete event action');
    }
  }

  // Event Names
  async fetchEventNames(): Promise<EventName[]> {
    const response = await fetch(PATHS.admin.eventNames);
    if (!response.ok) {
      throw new Error('Failed to fetch event names');
    }
    return response.json();
  }

  async deleteEventName(eventName: string): Promise<void> {
    const response = await fetch(`${PATHS.admin.eventNames}/${eventName}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete event name');
    }
  }
}

export const adminService = new AdminService();
