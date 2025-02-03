import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('useAuth', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  const mockSessionStorage = window.sessionStorage;

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual({
      userRole: '',
      isLoading: true,
      isAdmin: false,
      isAuthenticated: false,
    });
  });

  it('should redirect to home and keep loading state when no auth data exists', async () => {
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    expect(result.current).toEqual({
      userRole: '',
      isLoading: true,
      isAdmin: false,
      isAuthenticated: false,
    });
  });

  it('should set user role and finish loading when auth data exists for regular user', async () => {
    const authState = { username: 'user', role: 'user' };
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(authState)
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      userRole: 'user',
      isLoading: false,
      isAdmin: false,
      isAuthenticated: true,
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should set admin role and finish loading when auth data exists for admin', async () => {
    const authState = { username: 'admin', role: 'admin' };
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(authState)
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current).toEqual({
      userRole: 'admin',
      isLoading: false,
      isAdmin: true,
      isAuthenticated: true,
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('should handle invalid auth data gracefully', async () => {
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue('invalid-json');

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    expect(result.current).toEqual({
      userRole: '',
      isLoading: true,
      isAdmin: false,
      isAuthenticated: false,
    });
  });
});
