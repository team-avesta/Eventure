import { EEventType } from './services/adminS3Service';

export type Event = {
  id: string;
  coordinates: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  };
  screenshotId: string;
  eventType?: EEventType;
  name?: string;
  category?: string;
  action?: string;
  value?: string;
  dimensions?: string[];
  updatedAt?: string;
  description?: string;
  customTitle?: string;
  customUrl?: string;
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

export interface EventType {
  id: EEventType;
  name: string;
  color: string;
}
