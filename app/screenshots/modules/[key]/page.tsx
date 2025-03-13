'use client';

import { useState, useEffect } from 'react';
import ModuleScreenshotPage from '@/templates/ModuleScreenshotPage';

export default function Page() {
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      try {
        const { role } = JSON.parse(auth);
        setUserRole(role);
      } catch (error) {
        // If JSON parsing fails, default to non-admin view
        setUserRole('user');
      }
    }
  }, []);

  return <ModuleScreenshotPage userRole={userRole} />;
}
