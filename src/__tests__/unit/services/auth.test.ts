import { authService } from '@/services/auth';

describe('authService', () => {
  const mockSessionStorage = window.sessionStorage;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid user credentials', () => {
      const authState = authService.login({
        username: 'user',
        password: 'user',
      });
      expect(authState).toEqual({ username: 'user', role: 'user' });
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'auth',
        JSON.stringify(authState)
      );
    });

    it('should successfully login with valid admin credentials', () => {
      const authState = authService.login({
        username: 'admin',
        password: 'Lionking@9',
      });
      expect(authState).toEqual({ username: 'admin', role: 'admin' });
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'auth',
        JSON.stringify(authState)
      );
    });

    it('should return null for invalid username', () => {
      const authState = authService.login({
        username: 'invalid',
        password: 'user',
      });
      expect(authState).toBeNull();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return null for invalid password', () => {
      const authState = authService.login({
        username: 'user',
        password: 'wrong',
      });
      expect(authState).toBeNull();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear auth data from sessionStorage', () => {
      // First login
      const authState = authService.login({
        username: 'user',
        password: 'user',
      });
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'auth',
        JSON.stringify(authState)
      );

      // Then logout
      authService.logout();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth');
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      (mockSessionStorage.getItem as jest.Mock).mockReturnValue(null);
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toBeNull();
    });

    it('should return user data when logged in', () => {
      const authState = { username: 'user', role: 'user' };
      (mockSessionStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(authState)
      );
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toEqual(authState);
    });

    it('should return admin data when logged in as admin', () => {
      const authState = { username: 'admin', role: 'admin' };
      (mockSessionStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(authState)
      );
      const currentUser = authService.getCurrentUser();
      expect(currentUser).toEqual(authState);
    });
  });
});
