export type Event = {
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
  updatedAt?: string;
  description?: string;
};

export interface Screenshot {
  id: string;
  name: string;
  pageName: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  key: string;
  pages: string[];
  screenshots: Screenshot[];
}
