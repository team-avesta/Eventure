import { renderHook, act, waitFor } from '@testing-library/react';
import { useModuleData } from '@/hooks/useModuleData';
import {
  adminS3Service,
  Module,
  ScreenshotStatus,
} from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service', () => ({
  adminS3Service: {
    fetchModules: jest.fn(),
  },
  ScreenshotStatus: {
    DONE: 'DONE',
    IN_PROGRESS: 'IN_PROGRESS',
    TODO: 'TODO',
  },
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

describe('useModuleData', () => {
  // Mock data
  const mockModules: Module[] = [
    {
      id: 'module1',
      name: 'Homepage Module',
      key: 'homepage',
      screenshots: [
        {
          id: 'screenshot1',
          name: 'Homepage Screenshot',
          url: 'https://example.com/1.jpg',
          pageName: 'Home',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-02',
          status: ScreenshotStatus.DONE,
          labelId: 'label1',
        },
      ],
    },
    {
      id: 'module2',
      name: 'Dashboard Module',
      key: 'dashboard',
      screenshots: [],
    },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch module on mount', async () => {
    // Mock the API response
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValueOnce(
      mockModules
    );

    // Render the hook with a valid module key
    const { result } = renderHook(() => useModuleData('homepage'));

    // Initially should be loading with no data
    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentModule).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for the API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // After API call, should have data and not be loading
    expect(result.current.currentModule).toEqual(mockModules[0]);
    expect(result.current.error).toBeNull();

    // Should have called the API once
    expect(adminS3Service.fetchModules).toHaveBeenCalledTimes(1);
  });

  it('should handle module not found', async () => {
    // Mock the API response
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValueOnce(
      mockModules
    );

    // Render the hook with an invalid module key
    const { result } = renderHook(() => useModuleData('nonexistent'));

    // Wait for the API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should handle the not found case
    expect(result.current.currentModule).toBeNull();
    expect(result.current.error).toEqual(
      new Error('Module with key nonexistent not found')
    );

    // Should not show an error toast for not found
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    // Mock the API to throw an error
    const mockError = new Error('Failed to fetch modules');
    (adminS3Service.fetchModules as jest.Mock).mockRejectedValueOnce(mockError);

    // Render the hook
    const { result } = renderHook(() => useModuleData('homepage'));

    // Wait for the API call to reject
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should handle the error
    expect(result.current.currentModule).toBeNull();
    expect(result.current.error).toEqual(mockError);

    // Should show an error toast
    expect(toast.error).toHaveBeenCalledWith(mockError.message);
  });

  it('should allow manual refresh of module data', async () => {
    // Mock the API response for initial load
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValueOnce(
      mockModules
    );

    // Render the hook
    const { result } = renderHook(() => useModuleData('homepage'));

    // Wait for the initial API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock the API response for manual refresh with updated data
    const updatedModules = [
      {
        ...mockModules[0],
        name: 'Updated Homepage Module',
      },
      mockModules[1],
    ];
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValueOnce(
      updatedModules
    );

    // Manually refresh the module data
    act(() => {
      result.current.fetchModule();
    });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for the second API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have updated data
    expect(result.current.currentModule).toEqual(updatedModules[0]);

    // Should have called the API twice
    expect(adminS3Service.fetchModules).toHaveBeenCalledTimes(2);
  });

  it('should allow setting the current module directly', async () => {
    // Mock the API response
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValueOnce(
      mockModules
    );

    // Render the hook
    const { result } = renderHook(() => useModuleData('homepage'));

    // Wait for the API call to resolve
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Create a modified module
    const modifiedModule = {
      ...mockModules[0],
      name: 'Modified Module Name',
    };

    // Set the current module directly
    act(() => {
      result.current.setCurrentModule(modifiedModule);
    });

    // Should have the modified module
    expect(result.current.currentModule).toEqual(modifiedModule);

    // Should not have called the API again
    expect(adminS3Service.fetchModules).toHaveBeenCalledTimes(1);
  });
});
