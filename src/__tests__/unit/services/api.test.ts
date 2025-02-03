import { api } from '@/services/api';

describe('api', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('get', () => {
    it('should successfully fetch data', async () => {
      const mockData = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.get('test');
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/test');
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.get('test')).rejects.toThrow('Failed to fetch data');
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/test');
    });
  });

  describe('update', () => {
    const mockData = { name: 'test' };

    it('should successfully update data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await api.update('test', mockData);
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      });
    });

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.update('test', mockData)).rejects.toThrow(
        'Failed to update data'
      );
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      });
    });
  });

  describe('delete', () => {
    it('should successfully delete data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await api.delete('test');
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/test', {
        method: 'DELETE',
      });
    });

    it('should throw error when delete fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(api.delete('test')).rejects.toThrow('Failed to delete data');
      expect(mockFetch).toHaveBeenCalledWith('/api/s3/test', {
        method: 'DELETE',
      });
    });
  });
});
