export interface User {
  password: string;
  role: 'user' | 'admin';
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  username: string;
  role: string;
}
