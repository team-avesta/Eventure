import { Screenshot } from '@/types';

export async function getScreenshots(): Promise<Screenshot[]> {
  const response = await fetch('/api/screenshots');
  if (!response.ok) {
    throw new Error('Failed to fetch screenshots');
  }
  return response.json();
}

export async function getScreenshot(id: string): Promise<Screenshot> {
  const response = await fetch(`/api/screenshots/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch screenshot');
  }
  return response.json();
}

export async function createScreenshot(
  formData: FormData
): Promise<Screenshot> {
  const response = await fetch('/api/screenshots', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to create screenshot');
  }
  return response.json();
}

export async function deleteScreenshot(id: string): Promise<void> {
  const response = await fetch(`/api/screenshots/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete screenshot');
  }
}
