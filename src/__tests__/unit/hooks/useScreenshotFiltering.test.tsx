import { renderHook, act } from '@testing-library/react';
import { useScreenshotFiltering } from '@/hooks/useScreenshotFiltering';
import { ScreenshotStatus, Screenshot } from '@/services/adminS3Service';

describe('useScreenshotFiltering', () => {
  // Mock screenshots data with all required properties
  const mockScreenshots: Screenshot[] = [
    {
      id: '1',
      name: 'Homepage Screenshot',
      url: 'https://example.com/1.jpg',
      pageName: 'Home',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02',
      status: ScreenshotStatus.DONE,
      labelId: 'label1',
    },
    {
      id: '2',
      name: 'Dashboard View',
      url: 'https://example.com/2.jpg',
      pageName: 'Dashboard',
      createdAt: '2023-01-03',
      updatedAt: '2023-01-04',
      status: ScreenshotStatus.IN_PROGRESS,
      labelId: 'label2',
    },
    {
      id: '3',
      name: 'Settings Panel',
      url: 'https://example.com/3.jpg',
      pageName: 'Settings',
      createdAt: '2023-01-05',
      updatedAt: '2023-01-06',
      status: ScreenshotStatus.TODO,
      labelId: 'label1',
    },
    {
      id: '4',
      name: 'User Profile',
      url: 'https://example.com/4.jpg',
      pageName: 'Profile',
      createdAt: '2023-01-07',
      updatedAt: '2023-01-08',
      status: ScreenshotStatus.DONE,
      labelId: undefined,
    },
  ];

  it('should return all screenshots when no filters are applied', () => {
    const { result } = renderHook(() =>
      useScreenshotFiltering(mockScreenshots)
    );

    expect(result.current.filteredScreenshots).toHaveLength(4);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedLabelId).toBeNull();
  });

  it('should filter screenshots by search term', () => {
    const { result } = renderHook(() =>
      useScreenshotFiltering(mockScreenshots)
    );

    act(() => {
      result.current.handleSearch('dashboard');
    });

    expect(result.current.filteredScreenshots).toHaveLength(1);
    expect(result.current.filteredScreenshots[0].id).toBe('2');
    expect(result.current.searchTerm).toBe('dashboard');
  });

  it('should filter screenshots by label', () => {
    const { result } = renderHook(() =>
      useScreenshotFiltering(mockScreenshots)
    );

    act(() => {
      result.current.setSelectedLabelId('label1');
    });

    expect(result.current.filteredScreenshots).toHaveLength(2);
    expect(result.current.filteredScreenshots.map((s) => s.id)).toEqual([
      '1',
      '3',
    ]);
    expect(result.current.selectedLabelId).toBe('label1');
  });

  it('should apply both search and label filters together', () => {
    const { result } = renderHook(() =>
      useScreenshotFiltering(mockScreenshots)
    );

    act(() => {
      result.current.handleSearch('home');
      result.current.setSelectedLabelId('label1');
    });

    expect(result.current.filteredScreenshots).toHaveLength(1);
    expect(result.current.filteredScreenshots[0].id).toBe('1');
  });

  it('should handle multi-word search terms', () => {
    const { result } = renderHook(() =>
      useScreenshotFiltering(mockScreenshots)
    );

    act(() => {
      result.current.handleSearch('user profile');
    });

    expect(result.current.filteredScreenshots).toHaveLength(1);
    expect(result.current.filteredScreenshots[0].id).toBe('4');
  });

  it('should return empty array when no screenshots match filters', () => {
    const { result } = renderHook(() =>
      useScreenshotFiltering(mockScreenshots)
    );

    act(() => {
      result.current.handleSearch('nonexistent');
    });

    expect(result.current.filteredScreenshots).toHaveLength(0);
  });

  it('should handle undefined screenshots gracefully', () => {
    const { result } = renderHook(() => useScreenshotFiltering(undefined));

    expect(result.current.filteredScreenshots).toHaveLength(0);

    act(() => {
      result.current.handleSearch('test');
      result.current.setSelectedLabelId('label1');
    });

    // Should not throw errors
    expect(result.current.filteredScreenshots).toHaveLength(0);
  });
});
