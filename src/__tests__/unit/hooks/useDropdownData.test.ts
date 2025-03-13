import { renderHook, act, waitFor } from '@testing-library/react';
import { useDropdownData } from '@/hooks/useDropdownData';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service', () => ({
  adminS3Service: {
    fetchDropdownData: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

describe('useDropdownData', () => {
  const mockDropdownData = {
    pageData: [
      { id: 'page1', title: 'Home Page', url: '/home' },
      { id: 'page2', title: 'About Page', url: '/about' },
    ],
    dimensions: [
      {
        id: 'dim1',
        name: 'User ID',
        type: 'user',
        description: 'User identifier',
      },
      { id: 'dim2', name: 'Session ID', type: 'session' },
      { id: 'dim3', name: 'Device Type', type: 'device' },
    ],
    eventCategories: ['Navigation', 'Interaction'],
    eventActionNames: ['Click', 'View', 'Submit'],
    eventNames: ['Button Click', 'Page View'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchDropdownData as jest.Mock).mockResolvedValue(
      mockDropdownData
    );
  });

  it('should fetch dropdown data on mount', async () => {
    const { result } = renderHook(() => useDropdownData());

    // Initial state
    expect(result.current.data).toEqual({
      pageData: [],
      dimensions: [],
      eventCategories: [],
      eventActionNames: [],
      eventNames: [],
    });
    expect(result.current.error).toBeNull();

    // Wait for the data to be fetched
    await waitFor(() => expect(result.current.data).toEqual(mockDropdownData));

    // After data is fetched
    expect(adminS3Service.fetchDropdownData).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'API Error';
    (adminS3Service.fetchDropdownData as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useDropdownData());

    // Wait for the error to be handled
    await waitFor(() => expect(result.current.error).not.toBeNull());

    // After error is handled
    expect(result.current.error).toBe('Failed to load dropdown data');
    expect(toast.error).toHaveBeenCalledWith('Failed to load dropdown data');
  });

  it('should manually fetch dropdown data', async () => {
    const { result } = renderHook(() => useDropdownData());

    // Wait for the initial fetch
    await waitFor(() => expect(result.current.data).toEqual(mockDropdownData));

    // Clear the mock and set up new mock data
    (adminS3Service.fetchDropdownData as jest.Mock).mockClear();
    const newMockData = {
      ...mockDropdownData,
      pageData: [
        ...mockDropdownData.pageData,
        { id: 'page3', title: 'Contact', url: '/contact' },
      ],
    };
    (adminS3Service.fetchDropdownData as jest.Mock).mockResolvedValue(
      newMockData
    );

    // Manually fetch data
    await act(async () => {
      await result.current.fetchDropdownData();
    });

    // Verify the data was updated
    expect(result.current.data).toEqual(newMockData);
    expect(adminS3Service.fetchDropdownData).toHaveBeenCalledTimes(1);
  });
});
