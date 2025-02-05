export interface Screenshot {
  id: string;
  name: string;
  path: string;
  pageName: string;
  uploadedAt: string;
}

export interface Event {
  id: string;
  name: string;
  category: string;
  action: string;
  selector: string;
  coordinates: {
    x: number;
    y: number;
  };
  screenshotId: string;
  updatedAt: string;
  description?: string;
}

export interface Dimension {
  id: string;
  eventId: string;
  dimensionId: number;
  value: string;
  isRequired: boolean;
}

export interface ApiError {
  error: string;
  status?: number;
}
