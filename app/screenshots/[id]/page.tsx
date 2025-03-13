'use client';

import ScreenshotDetailPage from '@/templates/ScreenshotDetailPage';
import { useEffect, useState } from 'react';

export default function Page() {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      const { role } = JSON.parse(auth);
      setUserRole(role);
    }
  }, []);

  return <ScreenshotDetailPage userRole={userRole} />;
}
