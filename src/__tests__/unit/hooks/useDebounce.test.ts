import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 500 });

    // Value shouldn't change immediately
    expect(result.current).toBe('initial');

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('changed');
  });

  it('should handle multiple rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    // Multiple rapid changes
    rerender({ value: 'change1', delay: 500 });
    rerender({ value: 'change2', delay: 500 });
    rerender({ value: 'change3', delay: 500 });

    // Value shouldn't change yet
    expect(result.current).toBe('initial');

    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Still shouldn't change
    expect(result.current).toBe('initial');

    // Advance remaining time
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should only have the last value
    expect(result.current).toBe('change3');
  });

  it('should handle different delay times', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 200 },
      }
    );

    // Change with shorter delay
    rerender({ value: 'quick', delay: 200 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('quick');

    // Change with longer delay
    rerender({ value: 'slow', delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Shouldn't change yet
    expect(result.current).toBe('quick');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now it should change
    expect(result.current).toBe('slow');
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
