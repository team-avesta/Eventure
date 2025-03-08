import { renderHook, act, waitFor } from '@testing-library/react';
import { useLabelData } from '@/hooks/useLabelData';
import { pageLabelService } from '@/services/pageLabelService';
import { PageLabel } from '@/types/pageLabel';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/pageLabelService', () => ({
  pageLabelService: {
    getAllLabels: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

describe('useLabelData', () => {
  // Mock data
  const mockLabels: PageLabel[] = [
    { id: 'label1', name: 'Homepage' },
    { id: 'label2', name: 'Dashboard' },
    { id: 'label3', name: 'Settings' },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch labels on mount', async () => {
    // Mock the API response
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValueOnce(
      mockLabels
    );

    // Render the hook
    const { result } = renderHook(() => useLabelData());

    // Initially should be loading with empty data
    expect(result.current.isLoading).toBe(true);
    expect(result.current.labels).toEqual([]);
    expect(result.current.labelMap).toEqual({});
    expect(result.current.error).toBeNull();

    // Wait for the API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // After API call, should have data and not be loading
    expect(result.current.labels).toEqual(mockLabels);
    expect(result.current.labelMap).toEqual({
      label1: 'Homepage',
      label2: 'Dashboard',
      label3: 'Settings',
    });
    expect(result.current.error).toBeNull();

    // Should have called the API once
    expect(pageLabelService.getAllLabels).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    // Mock the API to throw an error
    const mockError = new Error('Failed to fetch labels');
    (pageLabelService.getAllLabels as jest.Mock).mockRejectedValueOnce(
      mockError
    );

    // Render the hook
    const { result } = renderHook(() => useLabelData());

    // Wait for the API call to reject
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should handle the error
    expect(result.current.labels).toEqual([]);
    expect(result.current.labelMap).toEqual({});
    expect(result.current.error).toEqual(mockError);

    // Should show an error toast
    expect(toast.error).toHaveBeenCalledWith(mockError.message);
  });

  it('should allow manual refresh of labels', async () => {
    // Mock the API response for initial load
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValueOnce(
      mockLabels
    );

    // Render the hook
    const { result } = renderHook(() => useLabelData());

    // Wait for the initial API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock the API response for manual refresh with updated data
    const updatedLabels = [...mockLabels, { id: 'label4', name: 'Profile' }];
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValueOnce(
      updatedLabels
    );

    // Manually refresh the labels
    act(() => {
      result.current.fetchLabels();
    });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for the second API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have updated data
    expect(result.current.labels).toEqual(updatedLabels);
    expect(result.current.labelMap).toEqual({
      label1: 'Homepage',
      label2: 'Dashboard',
      label3: 'Settings',
      label4: 'Profile',
    });

    // Should have called the API twice
    expect(pageLabelService.getAllLabels).toHaveBeenCalledTimes(2);
  });
});
