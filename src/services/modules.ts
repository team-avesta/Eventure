import { Module } from '@/types';

export async function getModules(): Promise<Module[]> {
  const response = await fetch('/api/modules');
  if (!response.ok) {
    throw new Error('Failed to fetch modules');
  }
  return response.json();
}

export async function updateModules(modules: Module[]): Promise<void> {
  const response = await fetch('/api/modules', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(modules),
  });

  if (!response.ok) {
    throw new Error('Failed to update modules');
  }
}
