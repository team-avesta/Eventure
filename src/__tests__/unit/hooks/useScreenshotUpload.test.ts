import { renderHook, act } from '@testing-library/react';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast');

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useScreenshotUpload', () => {
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
  const mockEvent = {
    preventDefault: jest.fn(),
  } as unknown as React.FormEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useScreenshotUpload());

    expect(result.current).toEqual({
      file: null,
      setFile: expect.any(Function),
      pageName: '',
      setPageName: expect.any(Function),
      customName: '',
      setCustomName: expect.any(Function),
      error: '',
      fileInputRef: expect.any(Object),
      isUploading: false,
      handleSubmit: expect.any(Function),
      resetForm: expect.any(Function),
    });
  });

  it('should reset form state', () => {
    const { result } = renderHook(() => useScreenshotUpload());

    // Set some values
    act(() => {
      result.current.setFile(mockFile);
      result.current.setPageName('test-page');
      result.current.setCustomName('test-name');
    });

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.pageName).toBe('');
    expect(result.current.customName).toBe('');
    expect(result.current.error).toBe('');
  });

  describe('file validation', () => {
    it('should validate file size', async () => {
      const { result } = renderHook(() => useScreenshotUpload());
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      });

      act(() => {
        result.current.setFile(largeFile);
        result.current.setPageName('test-page');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe('File size exceeds 10MB limit');
    });

    it('should validate file type', async () => {
      const { result } = renderHook(() => useScreenshotUpload());
      const invalidFile = new File(['test'], 'test.txt', {
        type: 'text/plain',
      });

      act(() => {
        result.current.setFile(invalidFile);
        result.current.setPageName('test-page');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe(
        'Invalid file type. Only JPEG, PNG and GIF are allowed'
      );
    });
  });

  describe('form submission', () => {
    it('should require file selection', async () => {
      const { result } = renderHook(() => useScreenshotUpload());

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe('Please select a file');
    });

    it('should require page name', async () => {
      const { result } = renderHook(() => useScreenshotUpload());

      act(() => {
        result.current.setFile(mockFile);
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe('Please select a module');
    });

    it('should handle successful upload', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useScreenshotUpload({ onSuccess }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setPageName('test-page');
        result.current.setCustomName('test-name');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/s3/screenshots', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Screenshot uploaded successfully'
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.file).toBeNull();
      expect(result.current.isUploading).toBe(false);
    });

    it('should handle upload error', async () => {
      const { result } = renderHook(() => useScreenshotUpload());

      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Module not found'),
      });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setPageName('test-page');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe(
        'Selected module was not found. Please try again.'
      );
      expect(result.current.isUploading).toBe(false);
    });

    it('should handle network error', async () => {
      const { result } = renderHook(() => useScreenshotUpload());

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      act(() => {
        result.current.setFile(mockFile);
        result.current.setPageName('test-page');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(result.current.error).toBe(
        'Failed to upload screenshot. Please try again.'
      );
      expect(toast.error).toHaveBeenCalledWith('Failed to upload screenshot');
      expect(result.current.isUploading).toBe(false);
    });
  });
});
