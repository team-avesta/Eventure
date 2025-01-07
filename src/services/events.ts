import axios from 'axios';
import { Event } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getEvents = async (screenshotId?: string): Promise<Event[]> => {
  const url = screenshotId
    ? `${API_URL}/events?screenshotId=${screenshotId}`
    : `${API_URL}/events`;
  const response = await axios.get(url);
  return response.data;
};

export const createEvent = async (
  event: Omit<Event, 'id' | 'updatedAt'>
): Promise<Event> => {
  const response = await axios.post(`${API_URL}/events`, {
    ...event,
    id: Date.now().toString(),
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const updateEvent = async (
  id: string,
  event: Partial<Event>
): Promise<Event> => {
  const response = await axios.put(`${API_URL}/events/${id}`, {
    ...event,
    updatedAt: new Date().toISOString(),
  });
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/events/${id}`);
};

// Helper function to validate CSS selector
export const validateSelector = async (selector: string): Promise<boolean> => {
  try {
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
};
