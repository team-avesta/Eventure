import { renderHook, act, waitFor } from '@testing-library/react';
import { useScreenshotManagement } from '@/hooks/useScreenshotManagement';
import {
  adminS3Service,
  Module,
  ScreenshotStatus,
} from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import { DragEndEvent } from '@dnd-kit/core';

// Mock dependencies
jest.mock('@/services/adminS3Service', () => ({
  adminS3Service: {
    deleteScreenshot: jest.fn(),
    updateScreenshotStatus: jest.fn(),
    updateScreenshotName: jest.fn(),
    updateScreenshotLabel: jest.fn(),
    updateScreenshotOrder: jest.fn(),
  },
  ScreenshotStatus: {
    DONE: 'DONE',
    IN_PROGRESS: 'IN_PROGRESS',
    TODO: 'TODO',
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('useScreenshotManagement', () => {
  // Mock data
  const mockModuleKey = 'homepage';
  const mockModule: Module = {
    id: 'module1',
    name: 'Homepage Module',
    key: mockModuleKey,
    screenshots: [
      {
        id: 'screenshot1',
        name: 'Homepage Screenshot 1',
        url: 'https://example.com/1.jpg',
        pageName: 'Home',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        status: ScreenshotStatus.DONE,
        labelId: 'label1',
      },
      {
        id: 'screenshot2',
        name: 'Homepage Screenshot 2',
        url: 'https://example.com/2.jpg',
        pageName: 'Home',
        createdAt: '2023-01-03',
        updatedAt: '2023-01-04',
        status: ScreenshotStatus.IN_PROGRESS,
        labelId: 'label2',
      },
    ],
    screenshotOrder: ['screenshot1', 'screenshot2'],
  };

  // Mock refreshModule function
  const mockRefreshModule = jest.fn().mockResolvedValue(undefined);

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    expect(result.current.screenshotToDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.isDragModeEnabled).toBe(false);
  });

  it('should handle screenshot deletion', async () => {
    // Mock successful deletion
    (adminS3Service.deleteScreenshot as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Set screenshot to delete
    act(() => {
      result.current.setScreenshotToDelete('screenshot1');
    });

    expect(result.current.screenshotToDelete).toBe('screenshot1');

    // Trigger delete
    await act(async () => {
      await result.current.handleDeleteScreenshot();
    });

    // Verify API was called
    expect(adminS3Service.deleteScreenshot).toHaveBeenCalledWith('screenshot1');
    expect(mockRefreshModule).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Screenshot deleted successfully'
    );

    // State should be reset
    expect(result.current.screenshotToDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle deletion errors', async () => {
    // Mock failed deletion
    const mockError = new Error('Failed to delete');
    (adminS3Service.deleteScreenshot as jest.Mock).mockRejectedValueOnce(
      mockError
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Set screenshot to delete
    act(() => {
      result.current.setScreenshotToDelete('screenshot1');
    });

    // Trigger delete
    await act(async () => {
      await result.current.handleDeleteScreenshot();
    });

    // Verify error handling
    expect(adminS3Service.deleteScreenshot).toHaveBeenCalledWith('screenshot1');
    expect(toast.error).toHaveBeenCalledWith(mockError.message);

    // State should be reset
    expect(result.current.screenshotToDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle status change', async () => {
    // Mock successful status update
    (adminS3Service.updateScreenshotStatus as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Trigger status change
    await act(async () => {
      await result.current.handleStatusChange(
        'screenshot1',
        ScreenshotStatus.IN_PROGRESS
      );
    });

    // Verify API was called
    expect(adminS3Service.updateScreenshotStatus).toHaveBeenCalledWith(
      'screenshot1',
      ScreenshotStatus.IN_PROGRESS
    );
    expect(mockRefreshModule).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Status updated successfully');
  });

  it('should handle name change', async () => {
    // Mock successful name update
    (adminS3Service.updateScreenshotName as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Trigger name change
    await act(async () => {
      await result.current.handleNameChange('screenshot1', 'New Name');
    });

    // Verify API was called
    expect(adminS3Service.updateScreenshotName).toHaveBeenCalledWith(
      'screenshot1',
      'New Name'
    );
    expect(mockRefreshModule).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Screenshot name updated successfully'
    );
  });

  it('should handle label change', async () => {
    // Mock successful label update
    (adminS3Service.updateScreenshotLabel as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Trigger label change
    await act(async () => {
      await result.current.handleLabelChange('screenshot1', 'newLabel');
    });

    // Verify API was called
    expect(adminS3Service.updateScreenshotLabel).toHaveBeenCalledWith(
      'screenshot1',
      'newLabel'
    );
    expect(mockRefreshModule).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Screenshot label updated successfully'
    );
  });

  it('should handle drag end and reordering', async () => {
    // Mock successful order update
    (adminS3Service.updateScreenshotOrder as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Create mock drag event
    const mockDragEvent = {
      active: { id: 'screenshot2' },
      over: { id: 'screenshot1' },
    } as unknown as DragEndEvent;

    // Trigger drag end
    await act(async () => {
      await result.current.handleDragEnd(mockDragEvent);
    });

    // Verify API was called with reordered IDs
    expect(adminS3Service.updateScreenshotOrder).toHaveBeenCalledWith(
      mockModuleKey,
      ['screenshot2', 'screenshot1']
    );
    expect(mockRefreshModule).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Screenshot order updated successfully'
    );
  });

  it('should handle drag end errors', async () => {
    // Mock failed order update
    const mockError = new Error('Failed to update order');
    (adminS3Service.updateScreenshotOrder as jest.Mock).mockRejectedValueOnce(
      mockError
    );

    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Create mock drag event
    const mockDragEvent = {
      active: { id: 'screenshot2' },
      over: { id: 'screenshot1' },
    } as unknown as DragEndEvent;

    // Trigger drag end
    await act(async () => {
      await result.current.handleDragEnd(mockDragEvent);
    });

    // Verify error handling
    expect(adminS3Service.updateScreenshotOrder).toHaveBeenCalledWith(
      mockModuleKey,
      ['screenshot2', 'screenshot1']
    );
    expect(toast.error).toHaveBeenCalledWith(mockError.message);

    // Should refresh module once for error recovery
    // Note: The implementation doesn't do optimistic updates in the UI anymore
    expect(mockRefreshModule).toHaveBeenCalledTimes(1);
  });

  it('should not call API when drag ends with no changes', async () => {
    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Create mock drag event with same source and destination
    const mockDragEvent = {
      active: { id: 'screenshot1' },
      over: { id: 'screenshot1' },
    } as unknown as DragEndEvent;

    // Trigger drag end
    await act(async () => {
      await result.current.handleDragEnd(mockDragEvent);
    });

    // Verify API was not called
    expect(adminS3Service.updateScreenshotOrder).not.toHaveBeenCalled();
    expect(mockRefreshModule).not.toHaveBeenCalled();
  });

  it('should toggle drag mode', () => {
    const { result } = renderHook(() =>
      useScreenshotManagement(mockModuleKey, mockModule, mockRefreshModule)
    );

    // Initially false
    expect(result.current.isDragModeEnabled).toBe(false);

    // Enable drag mode
    act(() => {
      result.current.setIsDragModeEnabled(true);
    });

    expect(result.current.isDragModeEnabled).toBe(true);

    // Disable drag mode
    act(() => {
      result.current.setIsDragModeEnabled(false);
    });

    expect(result.current.isDragModeEnabled).toBe(false);
  });
});
