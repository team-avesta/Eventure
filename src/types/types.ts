export type RectangleState = {
  id: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  color: string;
  eventType: string;
  action: string;
};

export type EventFormData = {
  name: string;
  category: string;
  action: string;
  value: string;
  dimensions: string[];
  description?: string;
};

export type FormState = {
  eventcategory?: string;
  eventactionname?: string;
  eventname?: string;
  eventvalue?: string;
  dimensions?: string[];
  description?: string;
  customUrl?: string;
};

export type DropdownData = {
  pageData: { id: string; title: string; url: string }[];
  eventCategories: string[];
  eventActionNames: string[];
  eventNames: string[];
  dimensions: { id: string; name: string }[];
};

export type Module = {
  key: string;
  name: string;
  screenshots: Screenshot[];
};

export type Screenshot = {
  id: string;
  name: string;
  url: string;
};
