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
      selectedLabel: '',
      setSelectedLabel: expect.any(Function),
      error: '',
      fileInputRef: expect.any(Object),
      isUploading: false,
      handleSubmit: expect.any(Function),
      resetForm: expect.any(Function),
    });
  });

  it('should update selectedLabel state when a label is selected', () => {
    const { result } = renderHook(() => useScreenshotUpload());

    expect(result.current.selectedLabel).toBe('');

    act(() => {
      result.current.setSelectedLabel('label-123');
    });

    expect(result.current.selectedLabel).toBe('label-123');

    // Test changing to a different label
    act(() => {
      result.current.setSelectedLabel('label-456');
    });

    expect(result.current.selectedLabel).toBe('label-456');

    // Test clearing the label
    act(() => {
      result.current.setSelectedLabel('');
    });

    expect(result.current.selectedLabel).toBe('');
  });

  it('should reset form state', () => {
    const { result } = renderHook(() => useScreenshotUpload());

    // Set some values
    act(() => {
      result.current.setFile(mockFile);
      result.current.setPageName('test-page');
      result.current.setCustomName('test-name');
      result.current.setSelectedLabel('test-label');
    });

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.pageName).toBe('');
    expect(result.current.customName).toBe('');
    expect(result.current.selectedLabel).toBe('');
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

      // Mock presigned URL response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ presignedUrl: 'test-url', key: 'test-key' }),
      });

      // Mock S3 upload response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Mock finalize response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setPageName('test-page');
        result.current.setCustomName('test-name');
        result.current.setSelectedLabel('test-label');
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // Verify presigned URL request
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `/api/s3/presigned?fileType=${encodeURIComponent(
          mockFile.type
        )}&moduleKey=${encodeURIComponent('test-page')}`
      );

      // Verify S3 upload request
      expect(mockFetch).toHaveBeenNthCalledWith(2, 'test-url', {
        method: 'PUT',
        body: mockFile,
        headers: {
          'Content-Type': mockFile.type,
        },
      });

      // Verify finalize request
      expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/s3/screenshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'test-key',
          pageName: 'test-page',
          customName: 'test-name',
          labelId: 'test-label',
        }),
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Screenshot uploaded successfully'
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.file).toBeNull();
      expect(result.current.isUploading).toBe(false);
    });

    it('should handle successful upload without a label', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useScreenshotUpload({ onSuccess }));

      // Mock presigned URL response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ presignedUrl: 'test-url', key: 'test-key' }),
      });

      // Mock S3 upload response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Mock finalize response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      act(() => {
        result.current.setFile(mockFile);
        result.current.setPageName('test-page');
        result.current.setCustomName('test-name');
        // Not setting a label
      });

      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // Verify finalize request
      expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/s3/screenshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'test-key',
          pageName: 'test-page',
          customName: 'test-name',
          labelId: undefined,
        }),
      });
    });

    it('should include the selected label in the API request', async () => {
      const { result } = renderHook(() => useScreenshotUpload());
      const labelId = 'label-test-id';

      // Mock presigned URL response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ presignedUrl: 'test-url', key: 'test-key' }),
      });

      // Mock S3 upload response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Mock finalize response
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Set up the form with a label
      act(() => {
        result.current.setFile(mockFile);
        result.current.setPageName('test-page');
        result.current.setCustomName('test-name');
        result.current.setSelectedLabel(labelId);
      });

      // Submit the form
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // Verify the label is included in the API request
      const finalizeCall = mockFetch.mock.calls[2];
      const requestBody = JSON.parse(finalizeCall[1].body);

      expect(requestBody).toHaveProperty('labelId', labelId);
      expect(finalizeCall[0]).toBe('/api/s3/screenshots');
      expect(finalizeCall[1].method).toBe('POST');
    });

    it('should handle upload error', async () => {
      const { result } = renderHook(() => useScreenshotUpload());

      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Failed to get upload URL'),
      });

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
