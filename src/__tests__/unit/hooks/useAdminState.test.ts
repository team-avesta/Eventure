import { renderHook, act } from '@testing-library/react';
import { useAdminState } from '@/hooks/useAdminState';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('useAdminState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAdminState());

    expect(result.current).toEqual({
      isLoading: false,
      isSubmitting: false,
      modalState: {
        type: null,
        isManage: false,
      },
      openModal: expect.any(Function),
      closeModal: expect.any(Function),
      handleSubmit: expect.any(Function),
    });
  });

  it('should open modal with correct state', async () => {
    const { result } = renderHook(() => useAdminState());

    await act(async () => {
      await result.current.openModal('module', true);
    });

    expect(result.current.modalState).toEqual({
      type: 'module',
      isManage: true,
    });
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useAdminState());

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.modalState).toEqual({
      type: null,
      isManage: false,
    });
  });

  describe('handleSubmit', () => {
    it('should handle module creation', async () => {
      const { result } = renderHook(() => useAdminState());
      const mockData = { name: 'test-module' };

      await act(async () => {
        await result.current.openModal('module', false);
      });

      await act(async () => {
        await result.current.handleSubmit('module', mockData);
      });

      expect(adminS3Service.createModule).toHaveBeenCalledWith(mockData.name);
      expect(toast.success).toHaveBeenCalledWith('Module added successfully');
      expect(result.current.modalState.type).toBeNull();
      expect(result.current.isSubmitting).toBeFalsy();
    });

    it('should handle module deletion', async () => {
      const { result } = renderHook(() => useAdminState());
      const mockData = 'test-module';

      await act(async () => {
        await result.current.openModal('module', true);
      });

      await act(async () => {
        await result.current.handleSubmit('module', mockData);
      });

      expect(adminS3Service.deleteModule).toHaveBeenCalledWith(mockData);
      expect(toast.success).toHaveBeenCalledWith('Module deleted successfully');
      expect(result.current.modalState.type).toBeNull();
      expect(result.current.isSubmitting).toBeFalsy();
    });

    it('should handle pageview creation', async () => {
      const { result } = renderHook(() => useAdminState());
      const mockData = { name: 'test-pageview' };

      await act(async () => {
        await result.current.openModal('pageview', false);
      });

      await act(async () => {
        await result.current.handleSubmit('pageview', mockData);
      });

      expect(adminS3Service.createPageView).toHaveBeenCalledWith(mockData);
      expect(toast.success).toHaveBeenCalledWith(
        'Page view added successfully'
      );
      expect(result.current.modalState.type).toBeNull();
      expect(result.current.isSubmitting).toBeFalsy();
    });

    it('should handle error cases', async () => {
      const { result } = renderHook(() => useAdminState());
      const mockError = new Error('Test error');
      (adminS3Service.createModule as jest.Mock).mockRejectedValueOnce(
        mockError
      );

      await act(async () => {
        await result.current.openModal('module', false);
      });

      await act(async () => {
        await result.current.handleSubmit('module', { name: 'test' });
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error updating data:',
        mockError
      );
      expect(toast.error).toHaveBeenCalledWith('Failed to update data');
      expect(result.current.isSubmitting).toBeFalsy();
    });
  });
});
