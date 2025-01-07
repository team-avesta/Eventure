const BASE_URL = '/api';
const ADMIN_BASE = `${BASE_URL}/admin`;

// Base paths for different resources
const PATHS = {
  admin: {
    modules: `${ADMIN_BASE}/modules`,
    pageViews: `${ADMIN_BASE}/pageviews`,
    dimensions: `${ADMIN_BASE}/dimensions`,
    eventCategories: `${ADMIN_BASE}/event-categories`,
    eventActions: `${ADMIN_BASE}/event-actions`,
    eventNames: `${ADMIN_BASE}/event-names`,
  },
};

export default PATHS;
