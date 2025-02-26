import { pageLabelService } from '@/services/pageLabelService';
import { api } from '@/services/api';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { PageLabel, PageLabelsResponse } from '@/types/pageLabel';

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid',
}));

// Mock the API service
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

describe('PageLabelService', () => {
  // Sample data for tests
  const mockPageLabels: PageLabel[] = [
    { id: 'label_1', name: 'Home' },
    { id: 'label_2', name: 'Dashboard' },
    { id: 'label_3', name: 'Settings' },
  ];

  const mockResponse: PageLabelsResponse = {
    pageLabels: mockPageLabels,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllLabels', () => {
    it('should return all page labels', async () => {
      // Mock API response
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Call the method
      const result = await pageLabelService.getAllLabels();

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(result).toEqual(mockPageLabels);
      expect(result.length).toBe(3);
    });

    it('should return empty array when API call fails', async () => {
      // Mock API error
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      // Call the method
      const result = await pageLabelService.getAllLabels();

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(result).toEqual([]);
    });

    it('should return empty array when API returns null or undefined', async () => {
      // Mock API returning null
      (api.get as jest.Mock).mockResolvedValueOnce(null);

      // Call the method
      const result = await pageLabelService.getAllLabels();

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(result).toEqual([]);
    });
  });

  describe('createLabel', () => {
    it('should create a new label and return it', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockResolvedValueOnce(undefined);

      // New label data
      const newLabelData = { name: 'New Label' };

      // Expected new label
      const expectedNewLabel = {
        id: 'label_mocked-uuid',
        name: 'New Label',
      };

      // Call the method
      const result = await pageLabelService.createLabel(newLabelData);

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(api.update).toHaveBeenCalledWith('pageLabels', {
        pageLabels: [...mockPageLabels, expectedNewLabel],
      });
      expect(result).toEqual(expectedNewLabel);
    });

    it('should handle API error when fetching existing labels', async () => {
      // Mock API error for get
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      (api.update as jest.Mock).mockResolvedValueOnce(undefined);

      // New label data
      const newLabelData = { name: 'New Label' };

      // Expected new label
      const expectedNewLabel = {
        id: 'label_mocked-uuid',
        name: 'New Label',
      };

      // Call the method
      const result = await pageLabelService.createLabel(newLabelData);

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(api.update).toHaveBeenCalledWith('pageLabels', {
        pageLabels: [expectedNewLabel],
      });
      expect(result).toEqual(expectedNewLabel);
    });

    it('should throw error if update fails', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockRejectedValueOnce(
        new Error('Update failed')
      );

      // New label data
      const newLabelData = { name: 'New Label' };

      // Call the method and expect it to throw
      await expect(pageLabelService.createLabel(newLabelData)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('updateLabel', () => {
    it('should update an existing label', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockResolvedValueOnce(undefined);

      // Label to update
      const labelId = 'label_2';
      const updates = { name: 'Updated Dashboard' };

      // Expected updated labels
      const expectedUpdatedLabels = [
        { id: 'label_1', name: 'Home' },
        { id: 'label_2', name: 'Updated Dashboard' },
        { id: 'label_3', name: 'Settings' },
      ];

      // Call the method
      await pageLabelService.updateLabel(labelId, updates);

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(api.update).toHaveBeenCalledWith('pageLabels', {
        pageLabels: expectedUpdatedLabels,
      });
    });

    it('should not modify labels if label ID does not exist', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockResolvedValueOnce(undefined);

      // Non-existent label ID
      const labelId = 'non_existent_id';
      const updates = { name: 'Updated Name' };

      // Call the method
      await pageLabelService.updateLabel(labelId, updates);

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(api.update).toHaveBeenCalledWith('pageLabels', {
        pageLabels: mockPageLabels, // Should be unchanged
      });
    });

    it('should throw error if update fails', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockRejectedValueOnce(
        new Error('Update failed')
      );

      // Label to update
      const labelId = 'label_2';
      const updates = { name: 'Updated Dashboard' };

      // Call the method and expect it to throw
      await expect(
        pageLabelService.updateLabel(labelId, updates)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteLabel', () => {
    it('should delete an existing label', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockResolvedValueOnce(undefined);

      // Label to delete
      const labelId = 'label_2';

      // Expected labels after deletion
      const expectedLabelsAfterDeletion = [
        { id: 'label_1', name: 'Home' },
        { id: 'label_3', name: 'Settings' },
      ];

      // Call the method
      await pageLabelService.deleteLabel(labelId);

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(api.update).toHaveBeenCalledWith('pageLabels', {
        pageLabels: expectedLabelsAfterDeletion,
      });
    });

    it('should not modify labels if label ID does not exist', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockResolvedValueOnce(undefined);

      // Non-existent label ID
      const labelId = 'non_existent_id';

      // Call the method
      await pageLabelService.deleteLabel(labelId);

      // Assertions
      expect(api.get).toHaveBeenCalledWith('pageLabels');
      expect(api.update).toHaveBeenCalledWith('pageLabels', {
        pageLabels: mockPageLabels, // Should be unchanged
      });
    });

    it('should throw error if delete operation fails', async () => {
      // Mock API responses
      (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (api.update as jest.Mock).mockRejectedValueOnce(
        new Error('Delete failed')
      );

      // Label to delete
      const labelId = 'label_2';

      // Call the method and expect it to throw
      await expect(pageLabelService.deleteLabel(labelId)).rejects.toThrow(
        'Delete failed'
      );
    });
  });
});
