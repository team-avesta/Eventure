import { User, UserCredentials, AuthState } from '@/types/auth';

const users: Record<string, User> = {
  user: { password: 'user', role: 'user' },
  admin: { password: 'Lionking@9', role: 'admin' },
};

export const authService = {
  login({ username, password }: UserCredentials): AuthState | null {
    const user = users[username];
    if (!user || user.password !== password) {
      return null;
    }

    const authState = { username, role: user.role };
    sessionStorage.setItem('auth', JSON.stringify(authState));
    return authState;
  },

  logout() {
    sessionStorage.removeItem('auth');
  },

  getCurrentUser(): AuthState | null {
    const auth = sessionStorage.getItem('auth');
    return auth ? JSON.parse(auth) : null;
  },
};
