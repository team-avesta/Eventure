import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthState } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (!auth) {
      router.push('/');
      return;
    }

    try {
      const { role } = JSON.parse(auth) as AuthState;
      setUserRole(role);
      setIsLoading(false);
    } catch (error) {
      router.push('/');
    }
  }, [router]);

  return {
    userRole,
    isLoading,
    isAdmin: userRole === 'admin',
    isAuthenticated: !!userRole,
  };
}
