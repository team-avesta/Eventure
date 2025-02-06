import { renderHook, act } from '@testing-library/react';
import { useModules } from '@/hooks/useModules';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

const mockModules = [
  { key: 'module1', name: 'Module 1' },
  { key: 'module2', name: 'Module 2' },
];

describe('useModules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValue(mockModules);
  });

  it('should fetch modules when opened', async () => {
    const { result } = renderHook(() => useModules(true));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.modules).toEqual([]);

    // Wait for fetch to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(adminS3Service.fetchModules).toHaveBeenCalled();
    expect(result.current.modules).toEqual(mockModules);
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch modules when closed', () => {
    renderHook(() => useModules(false));

    expect(adminS3Service.fetchModules).not.toHaveBeenCalled();
  });

  it('should clear selected module when closed', async () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useModules(isOpen),
      {
        initialProps: { isOpen: true },
      }
    );

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Set a selected module
    act(() => {
      result.current.setSelectedModule('module1');
    });

    expect(result.current.selectedModule).toBe('module1');

    // Close the modal
    rerender({ isOpen: false });

    expect(result.current.selectedModule).toBe('');
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Fetch error');
    (adminS3Service.fetchModules as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useModules(true));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch modules');
    expect(result.current.isLoading).toBe(false);
  });

  describe('deleteModule', () => {
    it('should not delete if no module is selected', async () => {
      const { result } = renderHook(() => useModules(true));

      // Wait for initial fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const success = await act(async () => {
        return await result.current.deleteModule();
      });

      expect(success).toBe(false);
      expect(adminS3Service.deleteModule).not.toHaveBeenCalled();
    });

    it('should delete selected module', async () => {
      const { result } = renderHook(() => useModules(true));

      // Wait for initial fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Select and delete a module
      act(() => {
        result.current.setSelectedModule('module1');
      });

      (adminS3Service.deleteModule as jest.Mock).mockResolvedValueOnce(
        undefined
      );

      const success = await act(async () => {
        return await result.current.deleteModule();
      });

      expect(success).toBe(true);
      expect(adminS3Service.deleteModule).toHaveBeenCalledWith('module1');
      expect(toast.success).toHaveBeenCalledWith('Module deleted successfully');
      expect(result.current.selectedModule).toBe('');
      expect(result.current.modules).toEqual([mockModules[1]]);
    });

    it('should handle delete error', async () => {
      const { result } = renderHook(() => useModules(true));

      // Wait for initial fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Select a module
      act(() => {
        result.current.setSelectedModule('module1');
      });

      const mockError = new Error('Delete error');
      (adminS3Service.deleteModule as jest.Mock).mockRejectedValueOnce(
        mockError
      );

      const success = await act(async () => {
        return await result.current.deleteModule();
      });

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Failed to delete module');
      expect(result.current.isDeleting).toBe(false);
    });
  });
});
