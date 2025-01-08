const BASE_URL = '/api/s3';

export const api = {
  async get<T>(type: string): Promise<T> {
    const response = await fetch(`${BASE_URL}/${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json();
  },

  async update<T>(type: string, data: T): Promise<void> {
    const response = await fetch(`${BASE_URL}/${type}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update data');
    }
  },

  async delete(path: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${path}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete data');
    }
  },
};
